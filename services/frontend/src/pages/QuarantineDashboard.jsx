
import React, {useEffect, useRef, useState} from 'react';
import axios from "axios";
import {Col, Container, Row, Form} from 'react-bootstrap';
import CurrentActionCard from "../components/CurrentActionCard.jsx";
import ResultsView from "../components/ResultsView.jsx";
import ToggleFilter from "../components/ToggleFilter.jsx";
import StatusCard from "../components/StatusCard.jsx";
import QuarantineForm from "../components/QuarantineForm.jsx";
import StopModal from "../components/StopModal.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";

const userId = "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
);

export default function QuarantineDashboard() {
    const [results, setResults] = useState([]);
    const [loadingAction, setLoadingAction] = useState(false);
    const [loadingQuarantineCheck, setLoadingQuarantineCheck] = useState(false);

    const [asn, setAsn] = useState('');
    const [ipv4, setIpv4] = useState('');
    const [ipv6, setIpv6] = useState('');
    const [mac, setMac] = useState('');
    const [currentAction, setCurrentAction] = useState('');
    const [actionOptions, setActionOptions] = useState([]);
    const [status, setStatus] = useState('');
    const [statusMsg, setStatusMsg] = useState('');
    const [checkEnded, setCheckEnded] = useState(false);
    const [showConfirmStop, setShowConfirmStop] = useState(false);
    const [showBgpConfirm, setShowBgpConfirm] = useState(false);
    const [viewFailed, setViewFailed] = useState(1);
    const [bgpCheckActive, setBgpCheckActive] = useState(false);

    const apiUrl = import.meta.env.VITE_API_URL;

    const abortControllerRef = useRef(null);
    const currentActionRef = useRef(null);
    const stopCheck = useRef(false);

    useEffect(() => {
        axios.get(`${apiUrl}/check`)
            .then(response => {
                setActionOptions(response.data || []);
            })
            .catch(error => {
                setCheckEnded(true);
                setLoadingQuarantineCheck(true);

                if (!error.response) {
                    setStatus("error");
                    setStatusMsg("Error connecting to the Digital Twin, please try again later.");
                } else {
                    setStatus("error");
                    setStatusMsg("An error occurred: " + error.response.statusText);
                }
            });
    }, []);

    useEffect(() => {
        if (currentActionRef.current) {
            currentActionRef.current.scrollIntoView({behavior: 'smooth'});
        }
    }, [currentAction]);

    function runCheck(data, last, signal) {
        data.uid = userId;
        data.last = last;
        return new Promise((resolve, reject) => {
            axios.post(`${apiUrl}/check/${data.action}`, data, {signal: signal})
                .then(response => {
                    if (response.data && response.data.data && response.data.data.results) {
                        resolve(response.data.data);
                    } else {
                        resolve([]);
                    }
                })
                .catch(error => {
                    console.error(error);
                    reject(error);
                });
        });
    }

    const handleFilter = (val) => {
        setViewFailed(val);
    };

    const getFilteredActionOptions = (actionOptions, bgpCheckActive) => {
        return bgpCheckActive
            ? actionOptions // Include all actions if bgpCheckActive is true
            : actionOptions.filter(action => !action.toLowerCase().includes("bgp")); // Exclude BGP actions
    };

    const proceedWithCheck = async () => {
        setLoadingQuarantineCheck(true);
        setStatus('');
        setStatusMsg('');
        setCheckEnded(false);

        stopCheck.current = false;

        abortControllerRef.current = new AbortController();

        setResults([]);
        let newResults = [];

        const data = {
            action: null,
            asn: asn,
            mac: mac,
            ipv4: ipv4,
            ipv6: ipv6
        };

        try {
            const filteredActionOptions = getFilteredActionOptions(actionOptions, bgpCheckActive);

            for (const [i, action] of filteredActionOptions.entries()) {
                if (stopCheck.current)
                    break;

                setLoadingAction(true);
                setCurrentAction(action);
                data.action = action;

                const last = (i === actionOptions.length - 1);

                const result = await runCheck(data, last, abortControllerRef.current.signal);
                newResults = [result, ...newResults];
                setResults(newResults);

                setLoadingAction(false);
            }

            if (newResults.every((action_result, _) => (action_result.results.every((test, _) => (test.status === 1))))) {
                setStatus("success");
                setStatusMsg(null);
            } else {
                setStatus("warning");
                setStatusMsg(null);
            }
        } catch (error) {
            if (!axios.isCancel(error)) {
                if (!error.response) {
                    setStatus("error");
                    setStatusMsg("Error connecting to the Digital Twin, please try again later.");
                } else {
                    let errorToPrint = "";
                    if (typeof error.response.data === "string") {
                        if (error.response.headers["content-type"] !== "text/html") {
                            errorToPrint = error.response.data;
                        } else {
                            errorToPrint = "Server responded with status " + error.status + ".";
                        }
                    } else {
                        if (error.response.data.detail instanceof Array) {
                            errorToPrint = error.response.data.detail[0].msg;
                        } else if (typeof error.response.data.detail === "string") {
                            errorToPrint = error.response.data.detail;
                        }
                    }

                    setStatus("error");
                    setStatusMsg(errorToPrint);
                }
            }
        }

        setLoadingAction(false);
        setCurrentAction("");
        setCheckEnded(true);
        setLoadingQuarantineCheck(false);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (bgpCheckActive) {
            setShowBgpConfirm(true);
            return;
        }

        await proceedWithCheck();
    };

    const handleBgpConfirm = async () => {
        setShowBgpConfirm(false);
        await proceedWithCheck();
    };

    const handleBgpCancel = () => {
        setShowBgpConfirm(false);
    };

    const handleStopClick = () => {
        setShowConfirmStop(true);
    };

    const handleConfirmStop = () => {
        stopCheck.current = true;

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        setShowConfirmStop(false);
    };

    const handleCancelStop = () => {
        setShowConfirmStop(false);
    };

    return (
        <Container>
            <h1 className="text-center mb-4">IXP Quarantine Checker</h1>
            <Row className="my-3">
                <Col>
                    <Form.Check
                        type="switch"
                        id="bgp-check-active-switch"
                        label="BGP Check Active"
                        checked={bgpCheckActive}
                        onChange={(e) => setBgpCheckActive(e.target.checked)}
                    />
                </Col>
            </Row>

            <QuarantineForm
                asn={asn}
                setAsn={setAsn}
                mac={mac}
                setMac={setMac}
                ipv4={ipv4}
                setIpv4={setIpv4}
                ipv6={ipv6}
                setIpv6={setIpv6}
                loadingQuarantineCheck={loadingQuarantineCheck}
                currentAction={currentAction}
                handleStopClick={handleStopClick}
                handleSubmit={handleSubmit}
            />

            <br/>
            <Row className="justify-content-center align-content-center">
                <Container>
                    {
                        checkEnded ?
                            <StatusCard status={status} msg={statusMsg}/>
                            :
                            (
                                <div ref={currentActionRef}>
                                    <CurrentActionCard action={currentAction} loading={loadingAction}/>
                                </div>
                            )
                    }

                    <Row className="align-items-center my-3">
                        <Col className="d-flex justify-content-end">
                            {(loadingQuarantineCheck || checkEnded) && results.length > 0 && (
                                <ToggleFilter viewFailed={viewFailed} handleFilter={handleFilter}/>
                            )}
                        </Col>
                    </Row>

                    <ResultsView results={results} viewFailed={viewFailed}/>

                    <StopModal
                        show={showConfirmStop}
                        onConfirm={handleConfirmStop}
                        onCancel={handleCancelStop}
                    />

                    <ConfirmModal
                        show={showBgpConfirm}
                        onConfirm={handleBgpConfirm}
                        onCancel={handleBgpCancel}
                    />
                </Container>
            </Row>
        </Container>
    );
}