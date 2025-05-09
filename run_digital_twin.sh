#!/bin/bash

sudo -E PATH=$PATH SUDO_UID=0 bash -c "cd services/backend/src/digital_twin && python3 start.py"
