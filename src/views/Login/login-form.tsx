import React, {useState} from "react";
import {Button, Card, Col, Form, InputGroup, Row, Spinner} from "react-bootstrap";
import {Eye, EyeOff} from "react-feather";
import {Link, useNavigate} from "react-router-dom";
import {useForm} from "react-hook-form";
import {useAuth} from "@/providers/auth";
import {useSmartTranslation} from "@/hooks/use-translation";

//Image
import Logo from "@/assets/img/logo-light.png";

type LoginFormInput = {
    email: string,
    password: string
}

export default function LoginForm()
{
    const auth = useAuth();
    const navigate = useNavigate();
    const {t} = useSmartTranslation();
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: {
            errors,
        },
    } = useForm<LoginFormInput>();

    return (
        <Form className="w-100" noValidate
            onSubmit={handleSubmit((data) => {
                setSubmitting(true);
                auth.signIn(
                    data.email.trim(),
                    data.password,
                    () => {
                        navigate('/dashboard', {replace: true});
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
                        <h5 className="mt-3 text-center">{t('accountingSystem')}</h5>
                    </div>
                    <Card className="card-lg card-border">
                        <Card.Body>
                            <h4 className="mb-1">{t('signInTitle')}</h4>
                            <p className="text-muted mb-4">{t('signInSubtitle')}</p>
                            <Row className="gx-3 mb-3">
                                <Col as={Form.Group} lg={12} className="mb-3">
                                    <div className="form-label-group">
                                        <Form.Label className='require-label'>{t('email')}</Form.Label>
                                    </div>
                                    <Form.Control
                                        required
                                        autoFocus
                                        autoComplete="username"
                                        placeholder={t('enterEmail')}
                                        type="email"
                                        isInvalid={!!errors.email?.message}
                                        {...register("email", {
                                            required: '*' + t('required'),
                                            pattern: {value: /^\S+@\S+\.\S+$/, message: t('invalidEmail')},
                                        })}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
                                </Col>
                                <Col as={Form.Group} lg={12} className="mb-3">
                                    <div className="form-label-group">
                                        <Form.Label className='require-label'>{t('password')}</Form.Label>
                                    </div>
                                    <InputGroup className="password-check">
                                        <span className="input-affix-wrapper">
                                            <Form.Control
                                                required
                                                autoComplete="current-password"
                                                placeholder={t('enterPassword')}
                                                type={showPassword ? "text" : "password"}
                                                isInvalid={!!errors.password?.message}
                                                {...register("password", {required: '*' + t('required')})}
                                            />
                                            <Link to="#" className="input-suffix text-muted" onClick={() => setShowPassword(!showPassword)}
                                                aria-label={showPassword ? t('hidePassword') : t('showPassword')}>
                                                <span className="feather-icon">
                                                    {showPassword ? <EyeOff className="form-icon" /> : <Eye className="form-icon" />}
                                                </span>
                                            </Link>
                                        </span>
                                    </InputGroup>
                                    <span className="text-danger small">{errors.password?.message}</span>
                                </Col>
                            </Row>
                            <Button variant="primary" disabled={submitting} type="submit" className="btn-uppercase btn-block">
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className={submitting ? 'me-2' : 'd-none'} />
                                {t('signIn')}
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Form>
    );
}
