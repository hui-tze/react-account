import React from 'react';
import { Button, Container, Nav, Navbar } from 'react-bootstrap';
import { HelpCircle } from 'react-feather';
import { Link, useRouteMatch } from 'react-router-dom';

//Images
import logo from '../../assets/img/logo-light.png';

const SimpleHeader = () => {
    const loginPath = useRouteMatch("/auth/login-simple");
    const signupPath = useRouteMatch("/auth/signup-simple");

    return (
        <Navbar expand="xl" className="hk-navbar navbar-light fixed-top">
            <Container>
                {/* Start Nav */}
                <div className="nav-start-wrap">
                    <Navbar.Brand as={Link} to="/" >
                        <img className="brand-img d-inline-block" src={logo} alt="brand" />
                    </Navbar.Brand>
                </div>
                
                {/* End Nav */}
                <div className="nav-end-wrap">
                    <Nav as="ul" className="flex-row">
                        {loginPath && <Nav.Item as="li" className="nav-link py-0">
                            <Button size='sm' variant="outline-light" >
                                <span>
                                    <span className="icon">
                                        <span className="feather-icon">
                                            <HelpCircle />
                                        </span>
                                    </span>
                                    <span>Get Help</span>
                                </span>
                            </Button>
                        </Nav.Item>}
                        {signupPath && <>
                            <Nav.Item as="li" className="nav-link py-0">
                                <Button variant="primary" as={Link} to="#">Help</Button>
                            </Nav.Item>
                            <Nav.Item as="li" className="nav-link py-0">
                                <Button variant="outline-light" as={Link} to="login">Sign In</Button>
                            </Nav.Item>
                        </>}
                    </Nav>
                </div>
                {/* /End Nav */}
            </Container>
        </Navbar>
    )
}

export default SimpleHeader
