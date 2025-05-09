import React from 'react';
import {Card, CardBody} from 'react-bootstrap';

const StatusCard = ({status, msg}) => {
    if (status === "success") {
        return (
            <Card className="text-bg-success mb-3">
                <CardBody className="fw-bold me-2">
                    Congratulations! Your configuration passed all the quarantine checks.
                    You are ready to be connected to the physical fabric.
                </CardBody>
            </Card>
        )
    } else if (status === "warning") {
        return (
            <Card className="text-bg-warning mb-3">
                <CardBody className="fw-bold me-2">
                    Your configuration did not pass the quarantine checks. Use the hints
                    provided by failed tests to fix your configuration and retry!
                </CardBody>
            </Card>
        )
    } else if (status === "error") {
        return (
            <Card className="text-bg-danger mb-3">
                <CardBody className="fw-bold me-2">
                    {msg}
                </CardBody>
            </Card>
        )
    }
};

export default StatusCard;
