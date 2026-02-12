#!/bin/bash

REPO_URL="git@github.com:KatharaFramework/ixp-digital-twin.git"
DEFAULT_NAME="ixp-digital-twin"

# Read user-defined path, if any
DESTINATION="${1:-../$DEFAULT_NAME}"

if [ -e "$DESTINATION" ]; then
    echo "Warning: destination '$DESTINATION' already exists. Exiting..." >&2
    exit 1
fi

git clone "$REPO_URL" "$DESTINATION"