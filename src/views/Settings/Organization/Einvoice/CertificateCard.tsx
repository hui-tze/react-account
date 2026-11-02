import {useRef, useState} from "react";
import {Alert, Button, Col, Form, Row, Spinner} from "react-bootstrap";
import {Shield, Trash2, Upload} from "react-feather";
import type {EinvoiceSetting} from "@/apis/models/einvoice";
import {einvoiceSettingApi} from "@/apis/requests/einvoice-api";
import {useNotification} from "@/hooks/notification";
import {useConfirmAction} from "@/hooks/use-confirmation-action";
import {useSmartTranslation} from "@/hooks/use-translation";

/**
 * Digital certificate (.p12) used to sign documents (MyInvois document version 1.1).
 * Uploaded on its own, outside the settings save, because it is a file.
 */
export function CertificateCard({setting, onChanged}: {setting: EinvoiceSetting, onChanged: () => Promise<unknown>}) {
    const {t} = useSmartTranslation();
    const notify = useNotification();
    const {confirmAndExecute} = useConfirmAction();
    const fileRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [passphrase, setPassphrase] = useState("");
    const [busy, setBusy] = useState(false);
    const certificate = setting.certificate;
    const expiresSoon = certificate?.expiry_date && new Date(certificate.expiry_date).getTime() - Date.now() < 30 * 86400_000;

    const upload = async () => {
        if (!file) {
            return;
        }
        setBusy(true);
        try {
            await einvoiceSettingApi.uploadCertificate(file, passphrase);
            notify.success(t('einvCertificateUploaded'));
            setFile(null);
            setPassphrase("");
            if (fileRef.current) {
                fileRef.current.value = "";
            }
            await onChanged();
        } catch (err) {
            notify.error(err);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="border rounded p-3 mb-3">
            <div className="d-flex align-items-center gap-2 mb-2">
                <Shield size={16} className="text-primary" />
                <span className="fw-semibold text-dark">{t('einvCertificate')}</span>
            </div>
            <p className="text-muted small">{t('einvCertificateHint')}</p>

            {certificate ? (
                <>
                    <Row className="g-3 mb-2">
                        <Col sm={4}><div className="small text-muted">{t('einvCertificateSubject')}</div><div className="fw-semibold">{certificate.alias}</div></Col>
                        <Col sm={4}><div className="small text-muted">{t('einvCertificateSerial')}</div><div className="fw-semibold">{certificate.serial_no}</div></Col>
                        <Col sm={4}><div className="small text-muted">{t('einvCertificateExpiry')}</div><div className={expiresSoon ? "fw-semibold text-danger" : "fw-semibold"}>{certificate.expiry_date}</div></Col>
                    </Row>
                    {expiresSoon && <Alert variant="warning" className="py-2 small">{t('einvCertificateExpiring')}</Alert>}
                    <Button variant="outline-danger" size="sm" type="button" disabled={busy} onClick={() => confirmAndExecute(async () => {
                        setBusy(true);
                        try {
                            await einvoiceSettingApi.removeCertificate();
                            notify.success(t('einvCertificateRemoved'));
                            await onChanged();
                        } catch (err) {
                            notify.error(err);
                        } finally {
                            setBusy(false);
                        }
                    }, {text: t('einvCertificateRemoveConfirm')})}>
                        <Trash2 size={14} className="me-1" />{t('einvCertificateRemove')}
                    </Button>
                </>
            ) : (
                <>
                    <Alert variant="info" className="py-2 small">{t('einvUnsignedNotice')}</Alert>
                    <Row className="g-3 align-items-end">
                        <Col md={5}>
                            <Form.Label>{t('einvCertificateFile')}</Form.Label>
                            <Form.Control ref={fileRef} type="file" accept=".p12,.pfx" onChange={(e) => setFile((e.target as HTMLInputElement).files?.[0] ?? null)} />
                        </Col>
                        <Col md={4}>
                            <Form.Label>{t('einvCertificatePassphrase')}</Form.Label>
                            <Form.Control type="password" autoComplete="new-password" value={passphrase} onChange={(e) => setPassphrase(e.target.value)} />
                        </Col>
                        <Col md={3}>
                            <Button variant="outline-primary" type="button" className="w-100" disabled={!file || busy} onClick={upload}>
                                {busy ? <Spinner animation="border" size="sm" className="me-1" /> : <Upload size={14} className="me-1" />}
                                {t('einvCertificateUpload')}
                            </Button>
                        </Col>
                    </Row>
                </>
            )}
        </div>
    );
}
