#!/bin/bash

DEFAULT_DIR="../ixp-digital-twin"
DESTINATION="${1:-$DEFAULT_DIR}"

if [ ! -d "$DESTINATION" ]; then
    echo "Error: directory '$DESTINATION' does not exist." >&2
    exit 1
fi

sudo -E PATH=$PATH SUDO_UID=0 bash -c "cd \"$DESTINATION\" && python3 start.py"