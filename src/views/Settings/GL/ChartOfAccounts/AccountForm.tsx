import {Badge, Button, Form, Offcanvas, Row, Col, Spinner} from "react-bootstrap";
import {useRequestForm} from "@/hooks/use-request-handler";
import {Account} from "@/apis/models/account";
import {AccountGroup} from "@/apis/models/account-group";
import {AccountClass} from "@/apis/models/account-class";
import {addAccount, AccountRequest, updateAccount} from "@/apis/requests/account-api";
import FormSection from "./FormSection";
import {useSmartTranslation} from "@/hooks/use-translation";
import {AccountTypeOptions} from "@/constants/AccountType";
import { SelectController } from "@/components/Select/SelectController";

export type AccountFormProps = {
    show: boolean,
    editing?: Account,
    presetGroupId?: number,
    classes: AccountClass[],
    groups: AccountGroup[],
    onHide: () => void,
    onSaved: (record: Account) => Promise<void>,
}

export default function AccountForm({show, editing, presetGroupId, classes, groups, onHide, onSaved}: AccountFormProps) {
    const {t} = useSmartTranslation();

    return (
        <Offcanvas show={show} onHide={onHide} placement="end">
            <Offcanvas.Header closeButton className="pb-0">
                <div>
                    <div className="text-uppercase fs-9 text-muted">{t('account')}</div>
                    <Offcanvas.Title>
                        {editing ? t('editAccountTitle', {code: editing.account_code}) : t('newAccount')}
                    </Offcanvas.Title>
                    <p className="text-muted small">{t('accountFormTips')}</p>
                    <div className="separator-full mb-0" />
                </div>
            </Offcanvas.Header>
            <Offcanvas.Body>
                {show && (
                    <AccountFormBody
                        key={editing?.id ?? "new"}
                        editing={editing}
                        presetGroupId={presetGroupId}
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

function AccountFormBody({editing, presetGroupId, classes, groups, onHide, onSaved}: Omit<AccountFormProps, "show">) {
    const {t} = useSmartTranslation();
    const {register, registerSelect, registerCheckbox, watch, formState, submitting, handleSubmitRequest, control} = useRequestForm<AccountRequest>({
        formOptions: {
            defaultValues: {
                account_group_id: editing?.account_group_id ?? presetGroupId ?? groups[0]?.id,
                account_code: editing?.account_code ?? "",
                account_name: editing?.account_name ?? "",
                account_type: editing?.account_type ?? "normal",
                allow_transaction: editing?.allow_transaction ?? true,
                is_control_account: editing?.is_control_account ?? false,
                status: editing?.status ?? "active",
            },
        },
    });
    const errors = formState.errors;
    const chosenGroupId = Number(watch("account_group_id"));
    const chosenGroup = groups.find(g => g.id === chosenGroupId);
    const chosenClass = chosenGroup ? classes.find(c => c.id === chosenGroup.account_class_id) : undefined;

    async function onSubmit(data: AccountRequest) {
        const payload: AccountRequest = {
            ...data,
            account_group_id: Number(data.account_group_id),
        };
        return editing ? await updateAccount(editing.id, payload) : await addAccount(payload);
    }

    return (
        <Form noValidate onSubmit={handleSubmitRequest({request: onSubmit, onSuccess: onSaved})}>
            <FormSection title={t('belongsTo')} hint={t('belongsToAccountHint')}>
                <Form.Group className="mb-2">
                    <Form.Label className="require-label">{t('accountGroup')}</Form.Label>
                    <Form.Select {...registerSelect("account_group_id", {required: '*' + t('required')})}>
                        {classes.map(c => {
                            const groupsInClass = groups.filter(g => g.account_class_id === c.id);
                            if (groupsInClass.length === 0) return null;
                            return (
                                <optgroup key={c.id} label={`${c.code} · ${c.name}`}>
                                    {groupsInClass.map(g => (
                                        <option key={g.id} value={g.id}>{g.code} — {g.name}</option>
                                    ))}
                                </optgroup>
                            );
                        })}
                    </Form.Select>
                </Form.Group>

                {chosenGroup && chosenClass && (
                    <div className="d-flex gap-1 flex-wrap mt-2">
                        <Badge bg="light" text="dark">{chosenClass.code} {chosenClass.name}</Badge>
                        <Badge bg={chosenClass.normal_balance === "debit" ? "primary" : "secondary"}>
                            {chosenClass.normal_balance === "debit" ? t('debitAbbr') : t('creditAbbr')}
                        </Badge>
                    </div>
                )}
            </FormSection>

            <FormSection title={t('identity')}>
                <Row className="gx-3">
                    <Col md={5}>
                        <Form.Group className="mb-3">
                            <Form.Label className="require-label">{t('accountCode')}</Form.Label>
                            <Form.Control type="text" className="font-monospace" maxLength={50} {...register("account_code", {required: '*' + t('required')})} />
                            <Form.Control.Feedback type="invalid">{errors.account_code?.message}</Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    <Col md={7}>
                        <Form.Group className="mb-3">
                            <Form.Label className="require-label">{t('accountName')}</Form.Label>
                            <Form.Control
                                type="text"
                                maxLength={255}
                                placeholder={t('accountNamePlaceholder')}
                                {...register("account_name", {required: '*' + t('required')})}
                            />
                            <Form.Control.Feedback type="invalid">{errors.account_name?.message}</Form.Control.Feedback>
                            <Form.Text muted>{t('accountNameHint')}</Form.Text>
                        </Form.Group>
                    </Col>
                </Row>
            </FormSection>

            <FormSection title={t('settings')}>
                <Row className="gx-3">
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('accountType')}</Form.Label>
                            <SelectController
                                name="account_type"
                                control={control}
                                options={AccountTypeOptions}
                                getOptionLabel={(opt) => t(opt.label)}
                                error={errors.account_type?.message}
                            />
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

                <Form.Group className="mb-2 pt-2 border-top">
                    <Form.Check
                        type="checkbox"
                        id="f-is-control"
                        className="py-1"
                        label={<><strong className="d-block">{t('controlAccount')}</strong><span className="text-muted small">{t('controlAccountCheckboxHint')}</span></>}
                        {...registerCheckbox("is_control_account")}
                    />
                    <Form.Check
                        type="checkbox"
                        id="f-allow-transaction"
                        className="py-1"
                        label={<><strong className="d-block">{t('allowManualJournals')}</strong><span className="text-muted small">{t('allowManualJournalsHint')}</span></>}
                        {...registerCheckbox("allow_transaction")}
                    />
                </Form.Group>
            </FormSection>

            <div className="d-flex gap-2 mt-3">
                <Button variant="outline-secondary" onClick={onHide} type="button">{t('cancel')}</Button>
                <Button type="submit" variant="primary" disabled={submitting}>
                    <Spinner as="span" animation="border" size="sm" className={submitting ? "me-2" : "d-none"} />
                    {editing ? t('saveChanges') : t('saveAccount')}
                </Button>
            </div>
        </Form>
    );
}
