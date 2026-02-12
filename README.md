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

## Tutorial
A comprehensive tutorial is available in the [wiki](https://github.com/KatharaFramework/ixp-digital-twin/wiki), explaining how to configure the [digital twin](https://github.com/KatharaFramework/ixp-digital-twin), its [management dashboard](https://github.com/KatharaFramework/ixp-digital-twin-dashboard), and the [quarantine dashboard](https://github.com/KatharaFramework/ixp-quarantine-dashboard).

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
- [IXP Digital Twin](https://github.com/KatharaFramework/ixp-digital-twin) is installed and
configured, as the dashboard relies on its functionalities.

## Installation

The IXP Quarantine Dashboard can be deployed and run either using Docker or by setting it up locally for development.

### Initialize the Digital Twin

Clone the IXP Quarantine Dashboard repository using the following command:
```shell script
git clone git@github.com:KatharaFramework/ixp-quarantine-dashboard.git
```

Enter the folder:
```shell script
cd ixp-quarantine-dashboard
```

Clone the IXP Digital Twin in the parent folder:
```shell script
./init_digital_twin.sh
```
This will clone into the `../ixp-digital-twin/` folder. You can change the destination folder by running: `./init_digital_twin.sh /another/folder`.

### Running with Docker

1. Run the digital twin using the `run_digital_twin.sh` script
    1. You can change the default digital twin folder `../ixp-digital-twin` by passing the new path as argument:
   ```shell script
    ./run_digital_twin.sh /another/folder
    ```
2. Modify the `docker-compose-{dev,prod}.yml` file to adjust ports and hostnames as needed for your environment. 
   1. You can change the default digital twin folder `../ixp-digital-twin` by changing the volume mounted for the `backend` service:
       ```yaml
         - services:
           backend:
             build: ./services/backend
             volumes:
               ...
               - ../ixp-digital-twin:/app/src/digital_twin # => Change to /another/folder:/app/src/digital_twin
       ```
3. Start the dashboard application using Docker:
    ```bash
    docker compose up --build -d
    ```
4. Access the dashboard via your web browser (default: `http://localhost:5173`).

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
