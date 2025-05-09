import asyncio
import ctypes
import ipaddress
import logging
import os
import re
import threading
from typing import Any, Awaitable, TypeVar
from typing import Optional, Dict

from Kathara.model.Lab import Lab
from Kathara.setting.Setting import Setting
from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi import status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import Field, BaseModel, IPvAnyAddress, model_validator, field_validator
from pydantic_settings import BaseSettings

import digital_twin.ixp.settings.settings as settings_module
from digital_twin.ixp.colored_logging import set_logging
from digital_twin.ixp.foundation.dumps.member_dump.member_dump_factory import MemberDumpFactory
from digital_twin.ixp.foundation.dumps.table_dump.table_dump_factory import TableDumpFactory
from digital_twin.ixp.globals import RESOURCES_FOLDER
from digital_twin.ixp.model.bgp_neighbour import BGPNeighbour
from digital_twin.ixp.network_scenario.network_scenario_manager import NetworkScenarioManager
from digital_twin.ixp.quarantine.action_manager import ActionManager

T = TypeVar("T")

MAC_ADDRESS_REGEX = re.compile(r"^([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}$")
LOCK_FILE_PATH = os.path.join("/tmp", ".ixplock")

ixp_config_path = os.path.join("digital_twin", "ixp.conf")
ixp_resource_path = os.path.join("digital_twin", "resources")

set_logging()
logger = logging.getLogger(__name__)


# FastAPI Configuration
class OSEnvSettings(BaseSettings):
    origin: str = ""
    environment: str = "dev"


env_settings = OSEnvSettings()
app = FastAPI()

origins = [
    env_settings.origin
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CancelOnDisconnect:
    """
    Dependency that can be used to wrap a coroutine,
    to cancel it if the request disconnects
    """

    def __init__(self, request: Request) -> None:
        self.request = request

    async def _poll(self):
        """
        Poll for a disconnect.
        If the request disconnects, stop polling and return.
        """
        try:
            while not await self.request.is_disconnected():
                await asyncio.sleep(0.01)

            logging.debug("Request disconnected, exiting poller")
        except asyncio.CancelledError:
            logging.debug("Polling loop cancelled")

    async def __call__(self, awaitable: Awaitable[T]) -> T:
        """Run the awaitable and cancel it if the request disconnects"""

        # Create two tasks, one to poll the request and check if the
        # client disconnected, and another which wraps the awaitable
        poller_task = asyncio.ensure_future(self._poll())
        main_task = asyncio.ensure_future(awaitable)

        _, pending = await asyncio.wait(
            [poller_task, main_task], return_when=asyncio.FIRST_COMPLETED
        )

        # Cancel any outstanding tasks
        for t in pending:
            t.cancel()

            try:
                await t
            except asyncio.CancelledError:
                logging.debug(f"{t} was cancelled")
            except Exception as exc:
                logging.debug(f"{t} raised {exc} when being cancelled")

        # This will:
        # - Raise asyncio.CancelledError if the handler was cancelled
        # - Return the value if it ran to completion
        # - Raise any other stored exception, if the task raised it
        return await main_task


def _async_raise(thread_id, exctype):
    """Raises the specified exception in the thread with the given thread ID."""
    tid = ctypes.c_long(thread_id)
    res = ctypes.pythonapi.PyThreadState_SetAsyncExc(tid, ctypes.py_object(exctype))
    if res == 0:
        raise ValueError("Invalid thread id")
    elif res > 1:
        ctypes.pythonapi.PyThreadState_SetAsyncExc(tid, None)
        raise SystemError("PyThreadState_SetAsyncExc failed")


def stop_thread(thread):
    """Attempt to stop the given thread by raising SystemExit in it."""
    _async_raise(thread.ident, SystemExit)


# IXP Logic
def load_settings() -> settings_module.Settings:
    settings = settings_module.Settings.get_instance()
    settings.load_from_disk()
    return settings


def get_network_scenario() -> Lab:
    Setting.get_instance().load_from_dict({"manager_type": "docker"})
    net_scenario_manager = NetworkScenarioManager()
    scenario = net_scenario_manager.get()
    if len(scenario.machines) <= 0:
        logging.error(f"Network Scenario `{scenario.name}` is not started!")
        exit(1)
    return scenario


def get_member_entries(settings: settings_module.Settings) -> dict[str, BGPNeighbour]:
    member_dump_class = MemberDumpFactory(submodule_package="digital_twin").get_class_from_name(settings.peering_configuration["type"])
    entries = member_dump_class().load_from_file(os.path.join(RESOURCES_FOLDER, settings.peering_configuration["path"]))
    return entries


def validate_member(members: dict[str, BGPNeighbour], member_args: dict[str, Any]) -> None:
    as_id = f"as{member_args['asn']}"
    if as_id not in members:
        # The ASN is not in the members, hence we assume that it is the one to test
        return

    find_ipv4 = member_args['ipv4'] != ""
    find_ipv6 = member_args['ipv6'] != ""

    for router in members[as_id].routers.values():
        for peering_set in router.peerings.values():
            for peering in peering_set:
                if peering.l2_address == member_args['mac']:
                    raise Exception(f"The specified MAC Address is in the Digital Twin.")
                if find_ipv4 and len(router.routes[4]) > 0 and \
                        peering.l3_address.version == 4 and peering.l3_address == member_args['ipv4']:
                    raise Exception(f"The specified IPv4 Address is in the Digital Twin.")
                if find_ipv6 and len(router.routes[6]) > 0 and \
                        peering.l3_address.version == 6 and peering.l3_address == member_args['ipv6']:
                    raise Exception(f"The specified IPv6 Address is in the Digital Twin.")


def validate_member_ips(
        settings: settings_module.Settings, ipv4: ipaddress.IPv4Address | str, ipv6: ipaddress.IPv6Address | str
) -> None:
    ips = {
        "4": ipv4,
        "6": ipv6,
    }

    for v in ips.keys():
        if ips[v] != "":
            if v not in settings.peering_lan:
                raise Exception(f"You cannot specify an IPv{v} address if a non-IPv{v} IXP.")

            if ips[v] not in settings.peering_lan[v]:
                raise Exception(f"The specified IPv{v} address is not in the peering LAN.")

            if ips[v] == settings.peering_lan[v].network_address:
                raise Exception(f"The specified IPv{v} address is the network address.")

            if ips[v] == settings.peering_lan[v].broadcast_address:
                raise Exception(f"The specified IPv{v} address is the broadcast address.")


def is_locked(uid: str) -> int:
    if not os.path.isfile(LOCK_FILE_PATH):
        return 0

    with open(LOCK_FILE_PATH, "r") as lock_file:
        lock_uid = lock_file.readline().strip()

    if lock_uid == uid:
        return 1
    else:
        return 2


def create_lock(uid: str) -> None:
    if not os.path.isfile(LOCK_FILE_PATH):
        with open(LOCK_FILE_PATH, "w") as lock_file:
            lock_file.write(uid)
    else:
        raise Exception()


def delete_lock() -> None:
    os.remove(LOCK_FILE_PATH)


def run_action(
        future: asyncio.Future, loop: asyncio.AbstractEventLoop, request: "CheckRequest",
        action_manager: ActionManager, scenario: Lab, entries: dict, check_args: dict) -> None:
    action_type = request.action.split(".")[0]
    action_name = request.action.split(".")[1]

    try:
        action_result = action_manager.run_action_by_name(request.action, scenario, entries, **check_args)

        if request.last:
            delete_lock()

        loop.call_soon_threadsafe(
            future.set_result,
            APIResponse(
                success=action_result.passed(),
                message=f"Check '{request.action}' executed successfully.",
                data={
                    "action_type": action_type.upper() if "bgp" in action_type else action_type.capitalize(),
                    "action_name": " ".join(re.findall(r'[A-Z](?:[a-z]+|[A-Z]*(?=[A-Z]|$))', action_name)),
                    "success": action_result.passed(),
                    "results": action_result.results
                }
            )
        )
    except Exception as e:
        loop.call_soon_threadsafe(future.set_exception, e)


actions = {}
network_scenario = None
settings = load_settings()
entries = get_member_entries(settings)
table_dump = TableDumpFactory(submodule_package="digital_twin").get_class_from_name(settings.rib_dumps["type"])(entries)

for v, file in settings.rib_dumps["dumps"].items():
    table_dump.load_from_file(os.path.join(RESOURCES_FOLDER, file))


# IXP FastAPI resources
class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None


class CheckRequest(BaseModel):
    action: str = Field(..., description="Action to be performed")
    asn: int = Field(None, description="Autonomous System Number")
    mac: str = Field(None, description="MAC Address")
    ipv4: IPvAnyAddress | str = Field(default="", validate_default=True, description="IPv4 Address")
    ipv6: IPvAnyAddress | str = Field(default="", validate_default=True, description="IPv6 Address")
    uid: str = Field(..., description="User ID")
    last: bool = Field(default=False, description="Notifies that this is the last Action")

    @model_validator(mode="after")
    def check_ip_specified(self) -> "CheckRequest":
        if not self.ipv4 and not self.ipv6:
            raise ValueError("either IPv4 or IPv6 address must be specified.")

        return self

    @field_validator('asn', mode='before')
    def asn(cls, value: str) -> str:
        try:
            int_value = int(value)
        except (TypeError, ValueError):
            raise ValueError("invalid ASN. Please provide the integer ASN without prefixes.")

        if not ((1 <= int_value <= 64495) or (131072 <= int_value <= 402332)):
            raise ValueError("invalid ASN. ASN must be in the valid range.")

        return value

    @field_validator('mac', mode='before')
    def mac(cls, value: str) -> str:
        if not MAC_ADDRESS_REGEX.match(value):
            raise ValueError("invalid MAC Address.")

        return value

    @field_validator('ipv4', mode='before')
    def ipv4(cls, value: str) -> str:
        if not value:
            return value

        try:
            ipaddress.IPv4Address(value)
        except ValueError:
            raise ValueError("invalid IPv4 Address.")

        return value

    @field_validator('ipv6', mode='before')
    def ipv6(cls, value: str) -> str:
        if not value:
            return value

        try:
            ipaddress.IPv6Address(value)
        except ValueError:
            raise ValueError("invalid IPv6 Address.")

        return value


# IXP Endpoints
@app.get('/check')
def get_actions():
    global network_scenario, actions
    settings = load_settings()
    actions = settings.quarantine
    return actions['actions']


@app.post('/check/{action}', response_model=APIResponse)
async def post_check_action(request: CheckRequest, disconnector: CancelOnDisconnect = Depends(CancelOnDisconnect)):
    global network_scenario, actions

    if network_scenario is None:
        network_scenario = get_network_scenario()

    if actions is None:
        actions = settings.quarantine

    check_args = {
        "asn": request.asn,
        "mac": request.mac,
        "ipv4": request.ipv4,
        "ipv6": request.ipv6
    }

    try:
        if env_settings.environment != "dev":
            validate_member(entries, check_args)
        validate_member_ips(settings, check_args["ipv4"], check_args["ipv6"])
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )

    lock_status = is_locked(request.uid)
    if lock_status == 2:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Another user is performing the quarantine check, please try again later."
        )
    elif lock_status == 0:
        create_lock(request.uid)

    action_manager = ActionManager()

    loop = asyncio.get_running_loop()
    future = loop.create_future()
    t = threading.Thread(
        target=run_action, args=(future, loop, request, action_manager, network_scenario, entries, check_args)
    )
    try:
        t.start()
        return await disconnector(future)
    except asyncio.CancelledError:
        stop_thread(t)
        future.cancel()

        delete_lock()

        raise HTTPException(503)
    except Exception as e:
        delete_lock()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to run check '{request.action}': {str(e)}"
        )
    finally:
        action_manager.clean_action_by_name(request.action, network_scenario, entries, **check_args)
