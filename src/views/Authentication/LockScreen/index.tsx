import React, {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {Button, Card, Col, Container, Form, InputGroup, Row, Spinner} from 'react-bootstrap';
import {Eye, EyeOff, User as UserIcon} from 'react-feather';
import Footer from './Footer';
import {useAuth} from '@/providers/auth';
import {useGetCurrentUser} from '@/apis/requests/auth-api';
import {useSmartTranslation} from '@/hooks/use-translation';

const initialsOf = (name: string | undefined) =>
    (name ?? "").split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0].toUpperCase()).join("") || "?";

/**
 * Covers the app after the idle timeout. The page underneath stays mounted (unsaved input survives)
 * but is made inert, so it can't be read by keyboard or screen reader until the password is entered.
 */
const LockScreen = () => {
    const { t } = useSmartTranslation();
    const auth = useAuth();
    // the last known user shows at once; the API refreshes it (and a failed request no longer leaves a blank name)
    const { data: user, error: userError } = useGetCurrentUser();
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [signingOut, setSigningOut] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const overlay = useRef<HTMLDivElement>(null);
    const input = useRef<HTMLInputElement>(null);

    // everything else on the page (app, modals, toasts) is inert while locked
    useEffect(() => {
        const others = Array.from(document.body.children)
            .filter((el): el is HTMLElement => el instanceof HTMLElement && el !== overlay.current && !el.inert);
        others.forEach(el => { el.inert = true; });
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        input.current?.focus();
        return () => {
            others.forEach(el => { el.inert = false; });
            document.body.style.overflow = prevOverflow;
        };
    }, []);

    const unlockScreen = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) {
            setError('*' + t('required'));
            return;
        }
        setSubmitting(true);
        setError(null);
        try {
            await auth.unlock(password);
        } catch (message) {
            setError(String(message));
            setPassword('');
            setSubmitting(false);
            input.current?.focus();
        }
    };

    const signOut = () => {
        setSigningOut(true);
        auth.signOut(() => window.location.assign("/"));
    };

    return createPortal(
        <div ref={overlay} className="hk-wrapper hk-pg-auth bg-primary-dark-3 position-fixed top-0 start-0 w-100 h-100 overflow-auto"
            style={{ zIndex: 2000 }} role="dialog" aria-modal="true" aria-label={t('screenLocked')}>
            <div className="hk-pg-wrapper pt-0 pb-xl-0 pb-5">
                <div className="hk-pg-body pt-0 pb-xl-0">
                    <Container>
                        <Row>
                            <Col sm={10} className="position-relative mx-auto">
                                <div className="auth-content py-8">
                                    <Form className="w-100" noValidate onSubmit={unlockScreen}>
                                        <Row>
                                            <Col lg={4} md={6} className="mx-auto">
                                                <Card className="card-flush bg-transparent">
                                                    <Card.Body className="text-center">
                                                        <div className="avatar avatar-xl avatar-primary avatar-rounded position-relative mb-3">
                                                            <span className="initial-wrap">{user?.name ? initialsOf(user.name) : <UserIcon size={28} aria-hidden />}</span>
                                                            <div className="badge-icon badge-icon-xxs text-primary position-bottom-end-overflow-1">
                                                                <div className="badge-icon-wrap">
                                                                    <i className="ri-lock-fill" />
                                                                </div>
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 127 127">
                                                                    <g data-name="Ellipse 302" transform="translate(8 8)" strokeWidth={3}>
                                                                        <circle cx="55.5" cy="55.5" r="55.5" stroke="currentColor" />
                                                                        <circle cx="55.5" cy="55.5" r="59.5" fill="currentColor" />
                                                                    </g>
                                                                </svg>
                                                            </div>
                                                        </div>
                                                        <h4 className="text-white">{user?.name ?? (userError ? t('screenLocked') : '…')}</h4>
                                                        <p className="p-sm mb-1 text-white opacity-55">{user?.email}</p>
                                                        <p className="p-sm mb-4 text-white opacity-55">{t('screenLockedHint')}</p>
                                                        {/* lets the browser's password manager match the account */}
                                                        <input type="email" name="email" autoComplete="username" value={user?.email ?? ''} readOnly hidden />
                                                        <Form.Group className="mb-2 text-start">
                                                            <InputGroup className="password-check">
                                                                <span className="input-affix-wrapper">
                                                                    <Form.Control
                                                                        ref={input}
                                                                        autoComplete="current-password"
                                                                        placeholder={t('enterPassword')}
                                                                        type={showPassword ? 'text' : 'password'}
                                                                        value={password}
                                                                        isInvalid={!!error}
                                                                        onChange={e => { setPassword(e.target.value); setError(null); }}
                                                                    />
                                                                    <button type="button" className="input-suffix text-muted btn btn-link p-0 border-0"
                                                                        onClick={() => setShowPassword(!showPassword)}
                                                                        aria-label={showPassword ? t('hidePassword') : t('showPassword')}>
                                                                        <span className="feather-icon">
                                                                            {showPassword ? <EyeOff className="form-icon" /> : <Eye className="form-icon" />}
                                                                        </span>
                                                                    </button>
                                                                </span>
                                                            </InputGroup>
                                                            {error && <div className="small text-danger mt-1" role="alert">{error}</div>}
                                                        </Form.Group>
                                                        <Button variant="primary" type="submit" disabled={submitting || signingOut} className="btn-uppercase btn-block mb-3">
                                                            {submitting && <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />}
                                                            {t('unlock')}
                                                        </Button>
                                                        <Button variant="link" type="button" onClick={signOut} disabled={signingOut}
                                                            className="text-white opacity-55 p-0">
                                                            {t('lockScreenSignOut')}
                                                        </Button>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        </Row>
                                    </Form>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </div>
                <Footer />
            </div>
        </div>,
        document.body
    );
}

export default LockScreen
