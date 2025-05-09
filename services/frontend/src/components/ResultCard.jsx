import React from 'react';
import {Accordion, Card} from 'react-bootstrap';
import {MdCheckCircle, MdError} from "react-icons/md";

function ResultCard({result}) {
    return (
        <Card className="mb-3 shadow-sm border-0">
            <Card.Header className="bg-gray border-0">
                <Card.Title as="h5" className="bg-gray">
                    <span className="fw-bold text-secondary me-2">
                        {result.action_type} Action: {result.action_name.replace(" Action", "")}
                    </span>
                </Card.Title>
            </Card.Header>
            <Card.Body>
                {result.results.map((action_result, index) => (
                    <Card className="mb-3 shadow-sm" key={index}>
                        <Card.Body className="d-flex align-items-center">
                            <span className="me-3">
                                {action_result.status === 1 ? (
                                    <MdCheckCircle size={24} color="green"/>
                                ) : (
                                    <MdError size={24} color="red"/>
                                )}
                            </span>
                            <Card.Text className="mb-0">
                                {action_result.reason}
                            </Card.Text>
                        </Card.Body>
                        {action_result.data &&
                            <Accordion>
                                <Accordion.Item eventKey="0">
                                    <Accordion.Header>
                                        More Details
                                    </Accordion.Header>
                                    <Accordion.Body dangerouslySetInnerHTML={{__html: action_result.data.replace("\n", "<br />")}}></Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                        }
                    </Card>
                ))}
            </Card.Body>
        </Card>
    );
}

export default ResultCard;