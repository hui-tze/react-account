import {useState} from "react";
import {Badge, Button, Card, Col, Form, InputGroup, Modal, Row, Spinner, Table} from "react-bootstrap";
import {Eye, EyeOff, Plus, Search, Shield, UserX} from "react-feather";
import {useSearchParams} from "react-router-dom";
import {Link} from "@/components/Access/Guarded";
import SimpleBar from "simplebar-react";
import {useForm, useWatch} from "react-hook-form";
import {accessApi, AccessRole, CompanyMember, MemberRequest} from "@/apis/requests/access-api";
import {SelectField, TextField} from "@/components/FormField/FormFields";
import {ConditionalError} from "@/components/Display/ErrorBoundary";
import {useNotification} from "@/hooks/notification";
import {useConfirmAction} from "@/hooks/use-confirmation-action";
import {useSmartTranslation} from "@/hooks/use-translation";
import {useAccess} from "@/providers/access";
import {applyServerErrors} from "@/views/Inventory/shared/document";
import {formatDate} from "@/utils/display-format";
import {ROLES_PATH} from "./RolePages";

const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join("") || "?";

type MemberForm = MemberRequest & {active: boolean};

/** Add a person (new account, or an existing account given access) or change one. */
function MemberModal({member, roles, onClose, onSaved}: {member: CompanyMember | null, roles: AccessRole[], onClose: () => void, onSaved: () => void}) {
    const {t} = useSmartTranslation();
    const notify = useNotification();
    const [showPassword, setShowPassword] = useState(false);
    const {control, handleSubmit, setError, formState: {isSubmitting}} = useForm<MemberForm>({
        defaultValues: {
            name: member?.name ?? "",
            email: member?.email ?? "",
            password: "",
            role_id: member?.role_id ?? roles.find(r => !r.is_admin)?.id ?? null,
            active: (member?.status ?? "active") === "active",
        },
    });
    const roleId = useWatch({control, name: "role_id"});
    const role = roles.find(r => r.id === roleId);

    const submit = handleSubmit(async ({active, ...values}) => {
        try {
            if (member) {
                await accessApi.editMember(member.id, {name: values.name, role_id: values.role_id, status: active ? "active" : "inactive", password: values.password || null});
            } else {
                await accessApi.addMember({name: values.name, email: values.email, password: values.password || null, role_id: values.role_id});
            }
            notify.success(member ? t('saved') : t('userAdded'));
            onSaved();
        } catch (e) {
            applyServerErrors(e, setError, ["name", "email", "password", "role_id", "status"]);
            notify.error(e);
        }
    });

    return (
        <Modal show onHide={onClose} centered>
            <Form noValidate onSubmit={submit} autoComplete="off">
                <Modal.Header closeButton>
                    <Modal.Title as="h5">{member ? t('editUser') : t('addUser')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {!member && <p className="small text-muted">{t('addUserHint')}</p>}
                    <TextField control={control} name="name" label={t('name')} required maxLength={255} />
                    {!member && (
                        <TextField control={control} name="email" label={t('email')} type="email" required
                            rules={{pattern: {value: /^\S+@\S+\.\S+$/, message: t('invalidEmail')}}} />
                    )}
                    {member && <div className="mb-3"><div className="form-label">{t('email')}</div><div>{member.email}</div></div>}
                    <Form.Group className="mb-3">
                        <Form.Label>{member ? t('newPassword') : t('password')}</Form.Label>
                        <InputGroup>
                            <Form.Control type={showPassword ? "text" : "password"} autoComplete="new-password"
                                placeholder={member ? t('leaveBlankToKeep') : t('passwordForNewAccount')}
                                {...control.register("password", {minLength: {value: 8, message: t('passwordMin8')}})} />
                            <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? t('hidePassword') : t('showPassword')}>
                                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                            </Button>
                        </InputGroup>
                        <Form.Text>{member ? t('newPasswordHint') : t('newAccountPasswordHint')}</Form.Text>
                    </Form.Group>
                    <SelectField control={control} name="role_id" label={t('role')} required numeric placeholder=""
                        options={roles.map(r => ({value: r.id, label: r.is_admin ? `${r.name} — ${t('fullAccess')}` : r.name}))}
                        hint={role?.description ?? undefined} />
                    {member && !member.is_you && (
                        <Form.Check type="switch" id="member-active" label={t('accessActive')} {...control.register("active")} />
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="light" onClick={onClose}>{t('cancel')}</Button>
                    <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Spinner size="sm" className="me-2" />}{member ? t('save') : t('addUser')}</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

/** Everyone who can sign in to the company, their role and whether their access is active. */
export function Users() {
    const {t} = useSmartTranslation();
    const notify = useNotification();
    const {confirmAndExecute} = useConfirmAction();
    const {canModule} = useAccess();
    const [search] = useSearchParams();
    const [query, setQuery] = useState("");
    const [status, setStatus] = useState("active");
    const [roleFilter, setRoleFilter] = useState<number | null>(search.get("role") ? Number(search.get("role")) : null);
    const [modal, setModal] = useState<{member: CompanyMember | null} | null>(null);

    const params = new URLSearchParams({...(status ? {status} : {}), ...(query ? {q: query} : {})});
    const {data: members, error, mutate} = accessApi.useMembers(params.toString());
    const {data: roles} = accessApi.useRoles();
    const rows = (members ?? []).filter(m => !roleFilter || m.role_id === roleFilter);

    const remove = (member: CompanyMember) => confirmAndExecute(async () => {
        try {
            await accessApi.removeMember(member.id);
            notify.success(t('userAccessRemoved', {name: member.name}));
            await mutate();
        } catch (e) {
            notify.error(e);
        }
    }, {text: t('removeAccessConfirm', {name: member.name})});

    if (error) {
        return <ConditionalError error={error} />;
    }

    return (
        <div className="app-body">
            <SimpleBar className="nicescroll-bar">
                <div className="container-fluid py-3">
                    <Card className="card-border mb-3 access-intro">
                        <Card.Body className="d-flex flex-wrap align-items-center gap-3">
                            <div className="flex-grow-1" style={{minWidth: 240}}>
                                <h5 className="mb-1">{t('menu_Users')}</h5>
                                <p className="text-muted small mb-0">{t('usersLead')}</p>
                            </div>
                            <Link to={ROLES_PATH} className="btn btn-outline-secondary btn-sm"><Shield size={14} className="me-1" />{t('menu_RolesAccess')}</Link>
                            {canModule("users", "create") && (
                                <Button size="sm" onClick={() => setModal({member: null})} disabled={!roles}><Plus size={14} className="me-1" />{t('addUser')}</Button>
                            )}
                        </Card.Body>
                    </Card>

                    <Card className="card-border">
                        <Card.Header>
                            <Row className="g-2 align-items-center">
                                <Col sm={6} lg={4}>
                                    <InputGroup size="sm">
                                        <InputGroup.Text><Search size={14} /></InputGroup.Text>
                                        <Form.Control value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('searchNameOrEmail')} />
                                    </InputGroup>
                                </Col>
                                <Col xs={6} sm={3} lg={2}>
                                    <Form.Select size="sm" value={roleFilter ?? ""} onChange={(e) => setRoleFilter(e.target.value ? Number(e.target.value) : null)} aria-label={t('role')}>
                                        <option value="">{t('allRoles')}</option>
                                        {(roles ?? []).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                    </Form.Select>
                                </Col>
                                <Col xs={6} sm={3} lg={2}>
                                    <Form.Select size="sm" value={status} onChange={(e) => setStatus(e.target.value)} aria-label={t('status')}>
                                        <option value="active">{t('active')}</option>
                                        <option value="inactive">{t('accessRemoved')}</option>
                                        <option value="">{t('all')}</option>
                                    </Form.Select>
                                </Col>
                            </Row>
                        </Card.Header>
                        {!members ? <div className="loader-pendulums my-5" /> : rows.length === 0 ? (
                            <Card.Body className="text-center text-muted py-5">{t('noRecords')}</Card.Body>
                        ) : (
                            <div className="table-responsive">
                                <Table hover className="mb-0 align-middle access-users">
                                    <thead className="table-light">
                                        <tr>
                                            <th>{t('user')}</th>
                                            <th>{t('role')}</th>
                                            <th className="d-none d-md-table-cell">{t('addedOn')}</th>
                                            <th>{t('status')}</th>
                                            <th />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map(m => (
                                            <tr key={m.id} className={m.status !== "active" ? "text-muted" : undefined}>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div className={`avatar avatar-xs avatar-rounded ${m.is_admin ? "avatar-primary" : "avatar-soft-primary"}`}>
                                                            <span className="initial-wrap">{initials(m.name)}</span>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="fw-semibold text-dark text-truncate">
                                                                {m.name}{m.is_you && <Badge bg="light" className="badge-soft-secondary ms-2">{t('you')}</Badge>}
                                                            </div>
                                                            <div className="small text-muted text-truncate">{m.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    {m.role_name
                                                        ? <Badge bg="light" className={m.is_admin ? "badge-soft-primary" : "badge-soft-info"}>{m.role_name}</Badge>
                                                        : <span className="text-muted">—</span>}
                                                </td>
                                                <td className="d-none d-md-table-cell small">{formatDate(m.added_at?.slice(0, 10))}</td>
                                                <td>
                                                    <Badge bg="light" className={m.status === "active" ? "badge-soft-success" : "badge-soft-secondary"}>
                                                        {m.status === "active" ? t('active') : t('accessRemoved')}
                                                    </Badge>
                                                </td>
                                                <td className="text-end text-nowrap">
                                                    {canModule("users", "edit") && (
                                                        <Button variant="link" size="sm" className="p-0 me-3" onClick={() => setModal({member: m})} disabled={!roles}>{t('edit')}</Button>
                                                    )}
                                                    {canModule("users", "delete") && m.status === "active" && !m.is_you && (
                                                        <Button variant="link" size="sm" className="p-0 text-danger" onClick={() => void remove(m)} title={t('removeAccess')}>
                                                            <UserX size={15} />
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </Card>
                </div>
            </SimpleBar>

            {modal && roles && (
                <MemberModal member={modal.member} roles={roles} onClose={() => setModal(null)} onSaved={() => { setModal(null); void mutate(); }} />
            )}
        </div>
    );
}
