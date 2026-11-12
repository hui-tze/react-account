import {Fragment, useMemo} from "react";
import {Badge, Button, Card, Col, Form, Row, Table} from "react-bootstrap";
import {Info, Lock, Plus, Shield, Trash2, Users} from "react-feather";
import {useNavigate, useParams} from "react-router-dom";
import {Link} from "@/components/Access/Guarded";
import SimpleBar from "simplebar-react";
import {Controller, useWatch} from "react-hook-form";
import {accessApi, AccessAction, AccessCatalogue, AccessRole, RoleRequest} from "@/apis/requests/access-api";
import {TextField} from "@/components/FormField/FormFields";
import {ConditionalError} from "@/components/Display/ErrorBoundary";
import {useRequestForm} from "@/hooks/use-request-handler";
import {useNotification} from "@/hooks/notification";
import {useConfirmAction} from "@/hooks/use-confirmation-action";
import {useSmartTranslation} from "@/hooks/use-translation";
import {useAccess} from "@/providers/access";
import SettingsFormPage from "@/views/Settings/shared/SettingsFormPage";
import {applyServerErrors} from "@/views/Inventory/shared/document";

export const ROLES_PATH = "/settings/user-management/roles";
export const USERS_PATH = "/settings/user-management/users";

const Loading = () => <div className="loader-pendulums my-5" />;

// one list from many (the project's TS lib has no Array.prototype.flat)
const flat = <T,>(lists: T[][]): T[] => ([] as T[]).concat(...lists);

/** How many modules a role reaches, for its card. */
function coverage(role: AccessRole, catalogue: AccessCatalogue | undefined) {
    const modules = flat(catalogue?.sections.map(s => s.modules) ?? []);
    const granted = new Set(role.permissions);
    const viewable = modules.filter(m => granted.has(`${m.key}.view`)).length;
    return {viewable, total: modules.length};
}

/** Roles of the company as cards: who has them and how much they reach. */
export function Roles() {
    const {t} = useSmartTranslation();
    const navigate = useNavigate();
    const notify = useNotification();
    const {confirmAndExecute: confirm} = useConfirmAction();
    const {canModule} = useAccess();
    const {data: roles, error, mutate} = accessApi.useRoles();
    const {data: catalogue} = accessApi.useCatalogue();

    if (error) {
        return <ConditionalError error={error} />;
    }
    if (!roles) {
        return <Loading />;
    }

    const remove = (role: AccessRole) => confirm(async () => {
        try {
            await accessApi.deleteRole(role.id);
            notify.success(t('roleDeleted'));
            await mutate();
        } catch (e) {
            notify.error(e);
        }
    }, {text: t('roleDeleteConfirm', {name: role.name})});

    return (
        <div className="app-body">
            <SimpleBar className="nicescroll-bar">
                <div className="container-fluid py-3">
                    <Card className="card-border mb-3 access-intro">
                        <Card.Body className="d-flex flex-wrap align-items-center gap-3">
                            <span className="access-intro-icon"><Shield size={20} /></span>
                            <div className="flex-grow-1" style={{minWidth: 240}}>
                                <h5 className="mb-1">{t('menu_RolesAccess')}</h5>
                                <p className="text-muted small mb-0">{t('rolesLead')}</p>
                            </div>
                            <Link to={USERS_PATH} className="btn btn-outline-secondary btn-sm"><Users size={14} className="me-1" />{t('menu_Users')}</Link>
                            {canModule("users", "create") && (
                                <Link to={`${ROLES_PATH}/create`} className="btn btn-primary btn-sm"><Plus size={14} className="me-1" />{t('newRole')}</Link>
                            )}
                        </Card.Body>
                    </Card>

                    <Row className="g-3">
                        {roles.map(role => {
                            const reach = coverage(role, catalogue);
                            return (
                                <Col key={role.id} md={6} xl={4}>
                                    <Card className={`card-border h-100 access-role-card ${role.is_admin ? "is-admin" : ""}`} role="button"
                                        onClick={() => navigate(`${ROLES_PATH}/${role.id}`)}>
                                        <Card.Body className="d-flex flex-column">
                                            <div className="d-flex align-items-start gap-2 mb-2">
                                                <span className="access-role-icon">{role.is_admin ? <Lock size={16} /> : <Shield size={16} />}</span>
                                                <div className="flex-grow-1 min-w-0">
                                                    <h6 className="mb-0 text-truncate">{role.name}</h6>
                                                    <div className="small text-muted text-truncate">{role.description || (role.is_admin ? t('adminRoleDescription') : "—")}</div>
                                                </div>
                                                {role.is_admin && <Badge bg="light" className="badge-soft-primary">{t('fullAccess')}</Badge>}
                                            </div>
                                            <div className="access-role-meter my-2">
                                                <div style={{width: `${reach.total ? Math.round(reach.viewable / reach.total * 100) : 0}%`}} />
                                            </div>
                                            <div className="d-flex flex-wrap gap-3 small text-muted mt-auto">
                                                <span><Users size={13} className="me-1" />{t('roleUserCount', {count: role.user_count})}</span>
                                                <span>{t('roleModuleCount', {count: reach.viewable, total: reach.total})}</span>
                                                {!role.is_admin && canModule("users", "delete") && (
                                                    <Button variant="link" size="sm" className="p-0 ms-auto text-danger" onClick={(e) => { e.stopPropagation(); void remove(role); }}
                                                        title={t('delete')}><Trash2 size={14} /></Button>
                                                )}
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            );
                        })}
                    </Row>
                </div>
            </SimpleBar>
        </div>
    );
}

const ACTION_KEYS: Record<AccessAction, string> = {view: 'accessView', create: 'accessCreate', edit: 'accessEdit', delete: 'accessDelete'};

/** The permission grid: sections → modules, a tick per action, with row / column / section toggles. */
function PermissionGrid({catalogue, value, onChange, readOnly}: {
    catalogue: AccessCatalogue, value: string[], onChange: (next: string[]) => void, readOnly: boolean,
}) {
    const {t} = useSmartTranslation();
    const granted = useMemo(() => new Set(value), [value]);
    const all = flat(catalogue.sections.map(s => flat(s.modules.map(m => m.actions.map(a => `${m.key}.${a}`)))));

    const set = (permissions: string[], on: boolean) => {
        const next = new Set(granted);
        permissions.forEach(p => {
            if (on) {
                next.add(p);
                // doing anything in a module needs seeing it
                next.add(`${p.split(".")[0]}.view`);
            } else {
                next.delete(p);
                // without view the rest of the module goes too
                if (p.endsWith(".view")) {
                    catalogue.actions.forEach(a => next.delete(`${p.split(".")[0]}.${a}`));
                }
            }
        });
        onChange(all.filter(p => next.has(p)));
    };
    const state = (permissions: string[]) => {
        const on = permissions.filter(p => granted.has(p)).length;
        return {checked: permissions.length > 0 && on === permissions.length, partial: on > 0 && on < permissions.length};
    };
    const Toggle = ({permissions, label}: {permissions: string[], label: string}) => {
        const s = state(permissions);
        return (
            <Form.Check type="checkbox" className="access-check" aria-label={label} disabled={readOnly} checked={s.checked}
                ref={(el: HTMLInputElement | null) => { if (el) el.indeterminate = s.partial; }}
                onChange={(e) => set(permissions, e.target.checked)} />
        );
    };

    return (
        <>
            {!readOnly && (
                <div className="d-flex flex-wrap gap-2 mb-3">
                    <Button size="sm" variant="outline-secondary" onClick={() => onChange(all)}>{t('accessPresetAll')}</Button>
                    <Button size="sm" variant="outline-secondary" onClick={() => onChange(all.filter(p => p.endsWith(".view")))}>{t('accessPresetViewOnly')}</Button>
                    <Button size="sm" variant="outline-secondary" onClick={() => onChange([])}>{t('accessPresetNone')}</Button>
                </div>
            )}
            <div className="table-responsive access-grid">
                <Table className="mb-0 align-middle">
                    <thead>
                        <tr>
                            <th>{t('module')}</th>
                            {catalogue.actions.map(a => (
                                <th key={a} className="text-center">
                                    <div className="d-flex flex-column align-items-center gap-1">
                                        <span>{t(ACTION_KEYS[a])}</span>
                                        <Toggle permissions={all.filter(p => p.endsWith(`.${a}`))} label={t(ACTION_KEYS[a])} />
                                    </div>
                                </th>
                            ))}
                            <th className="text-center">{t('accessAll')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {catalogue.sections.map(section => {
                            const sectionPermissions = flat(section.modules.map(m => m.actions.map(a => `${m.key}.${a}`)));
                            return (
                                <Fragment key={section.section}>
                                    <tr className="access-grid-section">
                                        <td colSpan={catalogue.actions.length + 1}>{t(`accessSection_${section.section}`, {defaultValue: section.section})}</td>
                                        <td className="text-center"><Toggle permissions={sectionPermissions} label={section.section} /></td>
                                    </tr>
                                    {section.modules.map(module => {
                                        const row = module.actions.map(a => `${module.key}.${a}`);
                                        return (
                                            <tr key={module.key}>
                                                <td>
                                                    {t(`accessModule_${module.key}`, {defaultValue: module.label})}
                                                    {catalogue.open_reads.includes(module.key) && <span className="access-open-read" title={t('accessOpenReadHint')}><Info size={12} /></span>}
                                                </td>
                                                {catalogue.actions.map(a => (
                                                    <td key={a} className="text-center">
                                                        {module.actions.includes(a) && (
                                                            <Form.Check type="checkbox" className="access-check" disabled={readOnly} aria-label={`${module.label} ${a}`}
                                                                checked={granted.has(`${module.key}.${a}`)} onChange={(e) => set([`${module.key}.${a}`], e.target.checked)} />
                                                        )}
                                                    </td>
                                                ))}
                                                <td className="text-center"><Toggle permissions={row} label={module.label} /></td>
                                            </tr>
                                        );
                                    })}
                                </Fragment>
                            );
                        })}
                    </tbody>
                </Table>
            </div>
            <p className="small text-muted mt-2 mb-0"><Info size={12} className="me-1" />{t('accessOpenReadNote')}</p>
        </>
    );
}

function RoleForm({record}: {record?: AccessRole}) {
    const {t} = useSmartTranslation();
    const navigate = useNavigate();
    const {data: catalogue} = accessApi.useCatalogue();
    const {canModule} = useAccess();
    const readOnly = !!record?.is_admin || !canModule("users", record ? "edit" : "create");

    const {control, setError, submitting, handleSubmitRequest} = useRequestForm<RoleRequest>({
        formOptions: {defaultValues: {name: record?.name ?? "", description: record?.description ?? "", permissions: record?.permissions ?? []}},
    });
    const permissions = useWatch({control, name: "permissions"});

    const submit = async (values: RoleRequest) => {
        const data = {...values, description: values.description || null};
        try {
            return record ? await accessApi.editRole(record.id, data) : await accessApi.addRole(data);
        } catch (e) {
            applyServerErrors(e, setError, ["name", "description", "permissions"]);
            throw e;
        }
    };

    return (
        <SettingsFormPage
            onSubmit={handleSubmitRequest({request: submit, onSuccess: async () => navigate(ROLES_PATH)})}
            submitting={submitting}
            isEditing={!!record}
            backTo={ROLES_PATH}
            readOnly={readOnly}
            stickyActions
            actionsSummary={<span className="small">{t('rolePermissionCount', {count: permissions?.length ?? 0})}</span>}
        >
            {record?.is_admin && (
                <div className="alert alert-info d-flex gap-2 align-items-center"><Lock size={16} />{t('adminRoleLocked')}</div>
            )}
            <Card className="card-border mb-3">
                <Card.Body>
                    <Row className="gx-4">
                        <Col md={5}>
                            <TextField control={control} name="name" label={t('roleName')} required maxLength={255} disabled={readOnly} placeholder={t('roleNamePlaceholder')} />
                        </Col>
                        <Col md={7}>
                            <TextField control={control} name="description" label={t('description')} maxLength={255} disabled={readOnly} placeholder={t('optional')} />
                        </Col>
                    </Row>
                    {record && (
                        <Link to={`${USERS_PATH}?role=${record.id}`} className="small"><Users size={13} className="me-1" />{t('roleUserCount', {count: record.user_count})}</Link>
                    )}
                </Card.Body>
            </Card>

            <Card className="card-border">
                <Card.Header className="d-flex align-items-center gap-2">
                    <span className="fw-semibold">{t('accessPermissions')}</span>
                    <span className="small text-muted">{t('accessPermissionsHint')}</span>
                </Card.Header>
                <Card.Body>
                    {!catalogue ? <Loading /> : (
                        <Controller control={control} name="permissions"
                            render={({field}) => <PermissionGrid catalogue={catalogue} value={field.value} onChange={field.onChange} readOnly={readOnly} />} />
                    )}
                </Card.Body>
            </Card>
        </SettingsFormPage>
    );
}

export function CreateRole() {
    return <RoleForm />;
}

export function EditRole() {
    const {id} = useParams();
    const {data, error} = accessApi.useRole(id);
    if (error) {
        return <ConditionalError error={error} />;
    }
    return data ? <RoleForm key={data.id} record={data} /> : <Loading />;
}

