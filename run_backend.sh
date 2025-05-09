#!/bin/bash

cd services/backend/src && ORIGIN=$ORIGIN ENVIRONMENT="dev" uvicorn main:app --host $HOST --port $PORT
