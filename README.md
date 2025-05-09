# Quarantine UI

## Pre-requisites
* Docker

## Run with Docker
- Run the digital twin using the `run_digital_twin.sh` script
- Change the ports and hostnames in the `docker-compose.yml`
- Run the application using Docker: 
```
docker compose up --build -d
```

# Develop locally

## Installation

Install the requirements for the backend application: 

```
python3 -m pip install -r services/backend/src/requirements.txt
python3 -m pip install -r services/backend/src/digital_twin/requirements.txt
```

Install the requirements for the frontend application: 

```
cd services/frontend
npm install
```

## Run the Application

Run the backend: 
```
ORIGIN="http://localhost" ./run_backend.sh
```

Or:
```
cd services/backend/sources
ORIGIN="http://localhost" uvicorn main:app --reload
```

Run the frontend: 
```
bash run_frontend.sh
```

Or:
```
cd services/frontend
npm run dev
```


