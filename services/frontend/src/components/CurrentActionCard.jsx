import React from 'react';
import {Card, Spinner} from 'react-bootstrap';

function CurrentActionCard({action, loading}) {
    let actionName = "";
    let actionType = "";

    if (action !== "") {
        actionType = action.split(".")[0].charAt(0).toUpperCase() + action.split(".")[0].substring(1);
        actionName = action.split(".")[1].replace(/([A-Z])/g, " $1");
        actionName = actionName.charAt(0).toUpperCase() + actionName.slice(1);
    }

    return (
        loading && (
            <Card className="mb-3 shadow-sm border-0">
                <Card.Body className="d-flex bg-light align-items-center">
                    <Spinner animation="border" role="status" className="me-3">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                    <span className="fw-bold text-muted">Executing {actionType} Action: {actionName.replace("Action", "")}</span>
                </Card.Body>
            </Card>
        )
    );
}

export default CurrentActionCard;
