import React from "react";
import {Col, Container, Row} from "react-bootstrap";
import LoginForm from "./login-form";
import classNames from "classnames";

export default function LoginClassic()
{
    return (
        <div className={classNames("hk-wrapper hk-pg-auth")} data-footer="simple">
            <div className="hk-pg-wrapper pt-0 pb-xl-0 pb-5">
                <div className="hk-pg-body pt-0 pb-xl-0">
                    <Container>
                        <Row>
                            <Col sm={10} className="position-relative mx-auto">
                                <div className="auth-content py-8">
                                    <LoginForm />
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </div>
                {/* Page Footer */}
                {/* <CommanFooter /> */}
            </div>
        </div>
    );
}


