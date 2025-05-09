import React from 'react';
import {Navbar, Container} from 'react-bootstrap';

function QuarantineNavbar() {
    return (
        <Navbar className="bg-body-tertiary">
            <Container>
                <Navbar.Brand href="#home" className="align-items-center align-content-center">
                    <img
                        alt="Digital Twin"
                        src="../../public/logo.png"
                        height="64px"
                        className="center-inline-block align-top"
                    />{' '}
                </Navbar.Brand>

            </Container>
        </Navbar>
    );
}

export default QuarantineNavbar;
