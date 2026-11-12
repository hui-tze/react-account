import {Button, Form, Offcanvas, Row, Col, Spinner} from "react-bootstrap";
import {useRequestForm} from "@/hooks/use-request-handler";
import {AccountClass} from "@/apis/models/account-class";
import {addAccountClass, AccountClassRequest, updateAccountClass} from "@/apis/requests/account-class-api";
import FormSection from "./FormSection";
import {useSmartTranslation} from "@/hooks/use-translation";
import {FormTextInput} from "@/components/FormInput/FormTextInput";

export type AccountClassFormProps = {
    show: boolean,
    editing?: AccountClass,
    onHide: () => void,
    onSaved: (record: AccountClass) => Promise<void>,
}

export default function AccountClassForm({show, editing, onHide, onSaved}: AccountClassFormProps) {
    const {t} = useSmartTranslation();

    return (
        <Offcanvas show={show} onHide={onHide} placement="end">
            <Offcanvas.Header closeButton className="pb-0">
                <div>
                    <div className="text-uppercase fs-9 text-muted">{t('chartClass')}</div>
                    <Offcanvas.Title>
                        {editing ? t('editClassTitle', {code: editing.code}) : t('newClass')}
                    </Offcanvas.Title>
                    <p className="text-muted small">{t('classFormTips')}</p>
                    <div className="separator-full mb-0" />
                </div>
            </Offcanvas.Header>
            <Offcanvas.Body>
                {show && <AccountClassFormBody key={editing?.id ?? "new"} editing={editing} onHide={onHide} onSaved={onSaved} />}
            </Offcanvas.Body>
        </Offcanvas>
    );
}

function AccountClassFormBody({editing, onHide, onSaved}: Omit<AccountClassFormProps, "show">) {
    const {t} = useSmartTranslation();

    const {register, registerSelect, formState, submitting, handleSubmitRequest} = useRequestForm<AccountClassRequest>({
        formOptions: {
            defaultValues: {
                code: editing?.code ?? "",
                name: editing?.name ?? "",
                normal_balance: editing?.normal_balance ?? "debit",
                financial_statement: editing?.financial_statement ?? "balance_sheet",
                sequence: editing?.sequence ?? 0,
                status: editing?.status ?? "active",
            },
        },
    });
    const errors = formState.errors;

    async function onSubmit(data: AccountClassRequest) {
        return editing ? await updateAccountClass(editing.id, data) : await addAccountClass(data);
    }

    return (
        <Form noValidate onSubmit={handleSubmitRequest({request: onSubmit, onSuccess: onSaved})}>
            <FormSection title={t('identity')}>
                <Row className="gx-3">
                    <Col md={12}>
                        <FormTextInput
                            label={t('code')}
                            name="code"
                            maxLength={50}
                            register={register}
                            error={errors.code}
                        />
                    </Col>
                    <Col md={12}>
                        <FormTextInput
                            label={t('name')}
                            name="name"
                            maxLength={255}
                            register={register}
                            error={errors.name}
                        />
                    </Col>
                </Row>
            </FormSection>

            <FormSection title={t('reporting')} hint={t('reportingHintClass')}>
                <Row className="gx-3">
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label className="require-label">{t('normalBalance')}</Form.Label>
                            <Form.Select {...registerSelect("normal_balance", {required: '*' + t('required')})}>
                                <option value="debit">{t('drOption')}</option>
                                <option value="credit">{t('crOption')}</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label className="require-label">{t('appearsOn')}</Form.Label>
                            <Form.Select {...registerSelect("financial_statement", {required: '*' + t('required')})}>
                                <option value="balance_sheet">{t('balanceSheet')}</option>
                                <option value="profit_loss">{t('profitOrLoss')}</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>
                <Row className="gx-3">
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('sequence')}</Form.Label>
                            <Form.Control type="number" {...register("sequence", {valueAsNumber: true})} />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('status')}</Form.Label>
                            <Form.Select {...registerSelect("status")}>
                                <option value="active">{t('active')}</option>
                                <option value="inactive">{t('inactive')}</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>
            </FormSection>

            <div className="d-flex gap-2 mt-3">
                <Button variant="outline-secondary" onClick={onHide} type="button">{t('cancel')}</Button>
                <Button type="submit" variant="primary" disabled={submitting}>
                    <Spinner as="span" animation="border" size="sm" className={submitting ? "me-2" : "d-none"} />
                    {editing ? t('saveChanges') : t('saveClass')}
                </Button>
            </div>
        </Form>
    );
}
