// components/BgpConfirmModal.jsx
import React from 'react';
import { Button, Modal } from 'react-bootstrap';

const ConfirmModal = ({ show, onConfirm, onCancel }) => {
    return (
        <Modal show={show} onHide={onCancel} centered>
            <Modal.Header closeButton>
                <Modal.Title className="text-warning">
                    ⚠️ BGP Checks Active
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="mb-3">
                    <strong>BGP checks are active!</strong>
                </p>
                <p className="mb-0">
                    Before proceeding, ensure that the device under test is
                    <strong> not connected to the Internet</strong>.
                </p>
                <p className="mt-3 text-muted">
                    Do you want to continue?
                </p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onCancel}>
                    Cancel
                </Button>
                <Button variant="warning" onClick={onConfirm}>
                    Continue
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ConfirmModal;