import React from 'react';
import { Button, Modal } from 'react-bootstrap';

const StopModal = ({ show, onConfirm, onCancel }) => {
    return (
        <Modal show={show} onHide={onCancel}>
            <Modal.Header closeButton>
                <Modal.Title>Stop Quarantine Checks</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Are you sure you want to stop the Quarantine Checks?
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onCancel}>
                    Cancel
                </Button>
                <Button variant="danger" onClick={onConfirm}>
                    Yes
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default StopModal;