import React from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';

const QuarantineForm = ({
    asn,
    setAsn,
    mac,
    setMac,
    ipv4,
    setIpv4,
    ipv6,
    setIpv6,
    loadingQuarantineCheck,
    currentAction,
    handleStopClick,
    handleSubmit,
}) => {
    return (
        <Form onSubmit={handleSubmit}>
            <Row>
                <Col>
                    <Form.Group className="mb-3" controlId="formAsn">
                        <Form.Label>ASN</Form.Label>
                        <Form.Control
                            type="text"
                            value={asn}
                            onChange={(e) => setAsn(e.target.value)}
                            placeholder="Enter ASN"
                            disabled={loadingQuarantineCheck}
                            required={true}
                        />
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="mb-3" controlId="formMac">
                        <Form.Label>MAC Address</Form.Label>
                        <Form.Control
                            type="text"
                            value={mac}
                            onChange={(e) => setMac(e.target.value)}
                            placeholder="Enter MAC Address"
                            disabled={loadingQuarantineCheck}
                            required={true}
                        />
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="mb-3" controlId="formIpv4">
                        <Form.Label>IPv4</Form.Label>
                        <Form.Control
                            type="text"
                            value={ipv4}
                            onChange={(e) => setIpv4(e.target.value)}
                            placeholder="Enter IPv4"
                            disabled={loadingQuarantineCheck}
                        />
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="mb-3" controlId="formIpv6">
                        <Form.Label>IPv6</Form.Label>
                        <Form.Control
                            type="text"
                            value={ipv6}
                            onChange={(e) => setIpv6(e.target.value)}
                            placeholder="Enter IPv6"
                            disabled={loadingQuarantineCheck}
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Row className="justify-content-center align-content-center">
                {!loadingQuarantineCheck && currentAction === "" && (
                    <Button variant="primary" type="submit" className="w-25">Run Checks</Button>
                )}

                {loadingQuarantineCheck && currentAction !== "" && (
                    <Button variant="danger" className="w-25" onClick={handleStopClick}>Stop Checks</Button>
                )}
            </Row>
        </Form>
    );
};

export default QuarantineForm;
