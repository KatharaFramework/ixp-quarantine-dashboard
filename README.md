# IXP Quarantine Dashboard

The IXP Quarantine Dashboard is a web-based GUI tool that provides an intuitive interface for managing and conducting
quarantine checks built on the capabilities of
the [IXP Digital Twin](https://github.com/KatharaFramework/ixp-digital-twin). It simplifies the validation process of
customer configurations, enabling IXPs to ensure compliance before connecting to the production environment.

## Overview

The IXP Quarantine Dashboard leverages the IXP Digital Twin to provide a streamlined and user-friendly interface for
running connectivity, routing, and security checks. It helps IXPs and their customers validate configurations in a
controlled emulation environment, reducing the risks posed to the actual production network during the onboarding
process.

### Why Use the IXP Quarantine Dashboard?

- **User-Friendly Interface**: Manage all quarantine checks and view their statuses through a clean and modern web-based
  UI.
- **Real-Time Feedback**: Monitor the results of quarantine checks with detailed explanations and suggestions for
  resolving issues.
- **Integration with IXP Digital Twin**: Utilizes the robust emulation features of the IXP Digital Twin to simulate
  real-world scenarios.
- **Simplified Onboarding Process**: Empowers customers to independently validate their configurations before connecting
  to the network.

For information on the underlying technology, refer to
the [IXP Digital Twin](https://github.com/KatharaFramework/ixp-digital-twin) documentation.

## Features

1. **GUI-Based Management**:
    - Perform quarantine checks directly from a browser interface.
    - View detailed status updates and logs for each check.

2. **Quarantine Validation**:
    - Conduct automated connectivity, routing, and security checks from the dashboard using the IXP Digital Twin
      backend.

3. **Actionable Feedback**:
    - Detailed troubleshooting suggestions provided for failed checks.

4. **Containerized Deployment**:
    - Easily deploy the dashboard using Docker or configure it to run locally for development and testing purposes.

## Prerequisites

To deploy and use the IXP Quarantine Dashboard, ensure the following prerequisites are met:

- **Docker**: For simplified containerized deployment.
- **Python 3.11 or higher**: Required to run the backend services.
- **Node.js and npm**: Needed for the frontend application.

Additionally, ensure the [IXP Digital Twin](https://github.com/KatharaFramework/ixp-digital-twin) is installed and
configured, as the dashboard relies on its functionalities.

## Installation

The IXP Quarantine Dashboard can be deployed and run either using Docker or by setting it up locally for development.

### Initialize the Digital Twin

To set up the repository along with the `ixp-digital-twin` submodule, follow these steps:

1. **Clone the Repository**  
   Clone the main repository using the following command:
   ```shell script
   git clone --recurse-submodules <repository-url>
   ```

2. **Initialize and Update Submodule** (if not done during cloning)  
   If the repository has already been cloned without submodules, initialize and update the submodule manually:
   ```shell script
   git submodule init
      git submodule update
   ```

3. **Pull Updates for Submodule** (Optional)  
   If necessary, ensure the submodule is up to date by running:
   ```shell script
   git submodule update --recursive --remote
   ```

Add proper configurations for the IXP Digital Twin to the `services/backend/src/digital_twin`
folder. For more information, refer to the [IXP Digital Twin](https://github.com/KatharaFramework/ixp-digital-twin)
setup instructions.

After completing these steps, the submodule will be set up and ready for use. This will ensure the `ixp-digital-twin` is
correctly located under the `services/backend/src/digital_twin` path.

### Running with Docker

1. Run the digital twin using the `run_digital_twin.sh` script
2. Modify the `docker-compose.yml` file to adjust ports and hostnames as needed for your environment.
3. Start the dashboard application using Docker:
    ```bash
    docker compose up --build -d
    ```
4. Access the dashboard via your web browser (default: `http://localhost`).

### Development Setup (Running Locally)

#### Backend Application

1. Install the required Python dependencies:
    ```bash
    python3 -m pip install -r services/backend/src/requirements.txt
    python3 -m pip install -r services/backend/src/digital_twin/requirements.txt
    ```

2. Run the backend application:
    ```bash
    ORIGIN="http://localhost" ./run_backend.sh
    ```
   Or:
    ```bash
    cd services/backend/sources
    ORIGIN="http://localhost" uvicorn main:app --reload
    ```

#### Frontend Application

1. Navigate to the frontend folder and install the necessary dependencies:
    ```bash
    cd services/frontend
    npm install
    ```

2. Run the frontend application:
    ```bash
    bash run_frontend.sh
    ```
   Or:
    ```bash
    npm run dev
    ```

The dashboard should now be accessible via your browser at the configured URL (default: `http://localhost:3000`).

## Quarantine Checks

The quarantine-dashboard facilitates the execution of a comprehensive set of checks provided by the IXP Digital Twin.
These include:

1. **Connectivity Validation**:
    - **Ping Tests**: Verifies that devices can reach each other using ICMP.
    - **MTU Validation**: Confirms the Maximum Transmission Unit (MTU) settings to prevent fragmentation.
    - **Proxy ARP Checks**: Ensures proxy ARP functions correctly for responding to ARP requests.

2. **BGP Routing Verification**:
    - **Session Validation**: Confirms the correct establishment of BGP sessions.
    - **Route Validation**: Ensures advertised prefixes do not exceed pre-defined thresholds.

3. **Security Audits**:
    - **Service Monitoring**: Identifies unauthorized services or processes.
    - **Traffic Inspection**: Analyzes network traffic for irregularities or policy violations.

Customers and administrators can use the dashboard to monitor the status of these checks and view actionable suggestions
for resolving configuration issues when failures occur.

## References

If you're interested in more details about the underlying emulation engine and quarantine check mechanisms, refer to
the [IXP Digital Twin Repository](https://github.com/KatharaFramework/ixp-digital-twin).

## Support Us

The IXP Quarantine Dashboard and the IXP-Digital-Twin are open-source projects funded by [Namex](https://www.namex.it/),
the IXP of Rome, and supported by [VSIX](https://www.vs-ix.org/).

If you'd like to contribute or have ideas for enhancing the dashboard, please contact us at `contact@kathara.org`.