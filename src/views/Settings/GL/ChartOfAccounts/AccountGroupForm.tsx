import {Badge, Button, Form, Offcanvas, Row, Col, Spinner} from "react-bootstrap";
import {useRequestForm} from "@/hooks/use-request-handler";
import {AccountGroup} from "@/apis/models/account-group";
import {AccountClass} from "@/apis/models/account-class";
import {addAccountGroup, AccountGroupRequest, updateAccountGroup} from "@/apis/requests/account-group-api";
import FormSection from "./FormSection";
import {useSmartTranslation} from "@/hooks/use-translation";

export type AccountGroupFormProps = {
    show: boolean,
    editing?: AccountGroup,
    presetClassId?: number,
    classes: AccountClass[],
    groups: AccountGroup[],
    onHide: () => void,
    onSaved: (record: AccountGroup) => Promise<void>,
}

export default function AccountGroupForm({show, editing, presetClassId, classes, groups, onHide, onSaved}: AccountGroupFormProps) {
    const {t} = useSmartTranslation();

    return (
        <Offcanvas show={show} onHide={onHide} placement="end">
            <Offcanvas.Header closeButton className="pb-0">
                <div>
                    <div className="text-uppercase fs-9 text-muted">{t('chartGroup')}</div>
                    <Offcanvas.Title>
                        {editing ? t('editGroupTitle', {code: editing.code}) : t('newGroup')}
                    </Offcanvas.Title>
                    <p className="text-muted small">{t('groupFormTips')}</p>
                    <div className="separator-full mb-0" />
                </div>
            </Offcanvas.Header>
            <Offcanvas.Body>
                {show && (
                    <AccountGroupFormBody
                        key={editing?.id ?? "new"}
                        editing={editing}
                        presetClassId={presetClassId}
                        classes={classes}
                        groups={groups}
                        onHide={onHide}
                        onSaved={onSaved}
                    />
                )}
            </Offcanvas.Body>
        </Offcanvas>
    );
}

function AccountGroupFormBody({editing, presetClassId, classes, groups, onHide, onSaved}: Omit<AccountGroupFormProps, "show">) {
    const {t} = useSmartTranslation();
    const {register, registerSelect, watch, formState, submitting, handleSubmitRequest} = useRequestForm<AccountGroupRequest>({
        formOptions: {
            defaultValues: {
                account_class_id: editing?.account_class_id ?? presetClassId ?? classes[0]?.id,
                parent_id: editing?.parent_id ?? null,
                code: editing?.code ?? "",
                name: editing?.name ?? "",
                sequence: editing?.sequence ?? 0,
                status: editing?.status ?? "active",
            },
        },
    });
    const errors = formState.errors;
    const chosenClassId = Number(watch("account_class_id"));
    const chosenClass = classes.find(c => c.id === chosenClassId);

    const parentOptions = groups.filter(g => g.account_class_id === chosenClassId && g.id !== editing?.id);

    async function onSubmit(data: AccountGroupRequest) {
        const payload: AccountGroupRequest = {
            ...data,
            account_class_id: Number(data.account_class_id),
            parent_id: data.parent_id ? Number(data.parent_id) : null,
            sequence: Number(data.sequence),
        };
        return editing ? await updateAccountGroup(editing.id, payload) : await addAccountGroup(payload);
    }

    return (
        <Form noValidate onSubmit={handleSubmitRequest({request: onSubmit, onSuccess: onSaved})}>
            <FormSection title={t('belongsTo')}>
                <Form.Group className="mb-3">
                    <Form.Label className="require-label">{t('class')}</Form.Label>
                    <Form.Select {...registerSelect("account_class_id", {required: '*' + t('required')})}>
                        {classes.map(c => (
                            <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                        ))}
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-2">
                    <Form.Label>{t('parentGroupOptional')}</Form.Label>
                    <Form.Select {...registerSelect("parent_id")}>
                        <option value="">{t('noneOption')}</option>
                        {parentOptions.map(g => (
                            <option key={g.id} value={g.id}>{g.code} — {g.name}</option>
                        ))}
                    </Form.Select>
                    <Form.Text muted>{t('parentGroupHint')}</Form.Text>
                </Form.Group>

                {chosenClass && (
                    <div className="d-flex gap-1 flex-wrap mt-2">
                        <Badge bg={chosenClass.normal_balance === "debit" ? "primary" : "secondary"}>
                            {t('normalBalance')} {chosenClass.normal_balance === "debit" ? t('debitAbbr') : t('creditAbbr')}
                        </Badge>
                        <Badge bg="light" text="dark">{chosenClass.financial_statement === "balance_sheet" ? t('balanceSheet') : t('profitOrLoss')}</Badge>
                    </div>
                )}
            </FormSection>

            <FormSection title={t('identity')}>
                <Row className="gx-3">
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label className="require-label">{t('groupCode')}</Form.Label>
                            <Form.Control type="text" maxLength={50} {...register("code", {required: '*' + t('required')})} />
                            <Form.Control.Feedback type="invalid">{errors.code?.message}</Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label className="require-label">{t('groupName')}</Form.Label>
                            <Form.Control type="text" maxLength={255} {...register("name", {required: '*' + t('required')})} />
                            <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                </Row>
            </FormSection>

            <FormSection title={t('settings')}>
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
                    {editing ? t('saveChanges') : t('saveGroup')}
                </Button>
            </div>
        </Form>
    );
}
