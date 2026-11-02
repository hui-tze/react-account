import {Button, Col, Container, Form, Row, Spinner} from "react-bootstrap";
import {useNavigate} from "react-router-dom";
import SimpleBar from "simplebar-react";
import {useRequestForm} from "@/hooks/use-request-handler";
import {FiscalYear} from "@/apis/models/fiscal-year";
import {FiscalYearRequest} from "@/apis/requests/fiscal-year-api";
import {useSmartTranslation} from "@/hooks/use-translation";

export type FiscalYearFormProps = {
    fiscalYear?: FiscalYear,
    onSubmit: (formData: FiscalYearRequest) => Promise<void>,
    onSuccess?: () => Promise<void>,
    onDelete?: () => void,
};

export function FiscalYearForm({fiscalYear, onSubmit, onSuccess, onDelete}: FiscalYearFormProps) {
    const {t} = useSmartTranslation();
    const navigate = useNavigate();

    const {register, registerSelect, formState, submitting, handleSubmitRequest} = useRequestForm<FiscalYearRequest>({
        formOptions: {
            defaultValues: {
                begin: fiscalYear?.begin ?? "",
                end: fiscalYear?.end ?? "",
                is_closed: fiscalYear?.is_closed ?? false,
                status: fiscalYear?.status ?? "active",
            },
        },
    });
    const errors = formState.errors;

    return (
        <div className="app-body">
            <SimpleBar className="nicescroll-bar">
                <Container fluid className="py-3">
                    <Form noValidate onSubmit={handleSubmitRequest({request: onSubmit, onSuccess})}>
                        <Row className="gx-3">
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="require-label">{t('beginDate')}</Form.Label>
                                    <Form.Control type="date" {...register("begin", {required: '*' + t('required')})} />
                                    <Form.Control.Feedback type="invalid">{errors.begin?.message}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="require-label">{t('endDate')}</Form.Label>
                                    <Form.Control type="date" {...register("end", {
                                        required: '*' + t('required'),
                                        validate: (value, values) => !values.begin || value > values.begin || t('endDateAfterBegin'),
                                    })} />
                                    <Form.Control.Feedback type="invalid">{errors.end?.message}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className="gx-3">
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>{t('status')}</Form.Label>
                                    <Form.Select {...registerSelect("status")}>
                                        <option value="active">{t('active')}</option>
                                        <option value="inactive">{t('inactive')}</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>{t('period')}</Form.Label>
                                    <Form.Check type="switch" id="is_closed" label={t('fiscalYearClosed')} {...register("is_closed")} />
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="d-flex gap-2 mt-3">
                            <Button variant="outline-secondary" type="button" onClick={() => navigate("/settings/gl/fiscal-years")}>{t('cancel')}</Button>
                            <Button type="submit" variant="primary" disabled={submitting}>
                                <Spinner as="span" animation="border" size="sm" className={submitting ? "me-2" : "d-none"} />
                                {fiscalYear ? t('saveChanges') : t('create')}
                            </Button>
                            {onDelete && (
                                <Button variant="outline-danger" type="button" className="ms-auto" onClick={onDelete}>{t('delete')}</Button>
                            )}
                        </div>
                    </Form>
                </Container>
            </SimpleBar>
        </div>
    );
}
