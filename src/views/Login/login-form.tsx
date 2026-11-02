import React, {useState} from "react";
import {Button, Card, Col, Form, InputGroup, Row, Spinner} from "react-bootstrap";
import {Eye, EyeOff} from "react-feather";
import {Link, useNavigate} from "react-router-dom";
import {useForm} from "react-hook-form";
import {useAuth} from "@/providers/auth";

//Image
import Logo from "@/assets/img/logo-light.png";

type LoginFormInput = {
    code: string,
    username: string,
    password: string
}

export default function LoginForm()
{ 
    const auth = useAuth();
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        trigger,
        handleSubmit,
        formState: {
            errors,
        },
    } = useForm<LoginFormInput>();

    return (
        <Form className="w-100" noValidate 
            onSubmit={handleSubmit((data) => {
                setSubmitting(true);
                trigger(["code", "username", "password"]);
                auth.signIn(
                    data.code,
                    data.username,
                    data.password,
                    (res) => {
                        const url = res.is_first_time_login ? '/change-password' : '/';
                        navigate(url, {replace: true});
                    },
                    () => {
                        setSubmitting(false);
                    },
                );
            })}>
            <Row>
                <Col lg={5} md={7} sm={10} className="mx-auto">
                    <div className="text-center mb-3">
                        <Link to="/" className="navbar-brand me-0">
                            <img className="brand-img d-inline-block" src={Logo} width={150} alt="brand" />
                        </Link>
                        <h5 className="mt-3 text-center">HR Management System</h5>
                    </div>
                    <Card className="card-lg card-border">
                        <Card.Body>
                            <Row className="gx-3 mb-3">
                                <Col as={Form.Group} lg={12} className="mb-3">
                                    <div className="form-label-group">
                                        <Form.Label className='require-label'>Company Code</Form.Label>
                                    </div>
                                    <Form.Control
                                        required
                                        placeholder="Enter the company code"
                                        type="text"
                                        isInvalid={!!errors.code?.message}
                                        {...register("code", {required: "*Required"})}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.code?.message}</Form.Control.Feedback>
                                </Col>
                                <Col as={Form.Group} lg={12} className="mb-3">
                                    <div className="form-label-group">
                                        <Form.Label className='require-label'>Username</Form.Label>
                                    </div>
                                    <Form.Control
                                        required
                                        placeholder="Enter username or email ID"
                                        type="text"
                                        isInvalid={!!errors.username?.message}
                                        {...register("username", {required: "*Required"})}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.username?.message}</Form.Control.Feedback>
                                </Col>
                                <Col as={Form.Group} lg={12} className="mb-3">
                                    <div className="form-label-group">
                                        <Form.Label className='require-label'>Password</Form.Label>
                                    </div>
                                    <InputGroup className="password-check">
                                        <span className="input-affix-wrapper">
                                            <Form.Control
                                                required
                                                placeholder="Enter your password"
                                                type={showPassword ? "text" : "password"}
                                                isInvalid={!!errors.password?.message}
                                                {...register("password", {required: "*Required"})}
                                            />
                                            <Link to="#" className="input-suffix text-muted" onClick={() => setShowPassword(!showPassword)} >
                                                <span className="feather-icon">
                                                    {
                                                        showPassword
                                                            ?
                                                            <EyeOff className="form-icon" />
                                                            :
                                                            <Eye className="form-icon" />
                                                    }

                                                </span>
                                            </Link>
                                        </span>
                                    </InputGroup>
                                    <span className="text-danger">{errors.password?.message}</span>
                                </Col>
                            </Row>
                            <Button variant="primary" disabled={submitting} type="submit" className="btn-uppercase btn-block">
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className={submitting ? '' : 'd-none'} />
                                Login
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Form>
    );
}
