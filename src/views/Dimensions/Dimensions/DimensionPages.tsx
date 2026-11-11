import {useEffect, useState} from "react";
import {Badge, Button, Card, Col, Form, Modal, Row, Spinner, Table} from "react-bootstrap";
import {ChevronRight, CornerDownRight, Edit2, Folder, Plus, Tag} from "react-feather";
import {useNavigate, useParams, useSearchParams} from "react-router-dom";
import {ActionButton, Link} from "@/components/Access/Guarded";
import SimpleBar from "simplebar-react";
import {useForm} from "react-hook-form";
import type {Dimension, DimensionValue} from "@/apis/models/dimension";
import {dimensionApi, DimensionRequest, DimensionValueRequest} from "@/apis/requests/dimension-api";
import {SelectField, SwitchField, TextField} from "@/components/FormField/FormFields";
import {ConditionalError} from "@/components/Display/ErrorBoundary";
import {useNotification} from "@/hooks/notification";
import {useSmartTranslation} from "@/hooks/use-translation";
import {applyServerErrors} from "@/views/Inventory/shared/document";
import {valueTree} from "../shared/DimensionFields";
import {DIMENSION_LIST_PATH, dimensionPath} from "../dimensions-menu";

const Loading = () => <div className="loader-pendulums my-5" />;

function Page({children}: {children: React.ReactNode}) {
    return (
        <div className="app-body">
            <SimpleBar className="nicescroll-bar">
                <div className="container-fluid py-3">{children}</div>
            </SimpleBar>
        </div>
    );
}

function StatusBadge({status}: {status: string}) {
    const {t} = useSmartTranslation();
    return <Badge bg="light" className={status === "active" ? "badge-soft-success" : "badge-soft-secondary"}>{t(status === "active" ? 'active' : 'inactive')}</Badge>;
}

/** Create / edit a dimension (code, name, required, status). */
function DimensionModal({dimension, onClose, onSaved}: {dimension: Dimension | null, onClose: () => void, onSaved: (d: Dimension) => void}) {
    const {t} = useSmartTranslation();
    const notify = useNotification();
    const {control, handleSubmit, setError, formState: {isSubmitting}} = useForm<DimensionRequest & {active: boolean}>({
        defaultValues: {
            code: dimension?.code ?? "",
            name: dimension?.name ?? "",
            is_required: dimension?.is_required ?? false,
            status: dimension?.status ?? "active",
            active: (dimension?.status ?? "active") === "active",
        },
    });

    const submit = handleSubmit(async ({active, ...values}) => {
        const data = {...values, status: active ? "active" : "inactive"};
        try {
            const saved = dimension ? await dimensionApi.editDimension(dimension.id, data) : await dimensionApi.addDimension(data);
            notify.success(t('saved'));
            onSaved(saved);
        } catch (e) {
            applyServerErrors(e, setError, ["code", "name"]);
            notify.error(e);
        }
    });

    return (
        <Modal show onHide={onClose} centered>
            <Form noValidate onSubmit={submit}>
                <Modal.Header closeButton>
                    <Modal.Title as="h5">{dimension ? t('editDimension') : t('newDimension')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="small text-muted">{t('dimensionIntro')}</p>
                    <Row className="gx-3">
                        <Col sm={4}>
                            <TextField control={control} name="code" label={t('code')} required maxLength={50} placeholder="CC" />
                        </Col>
                        <Col sm={8}>
                            <TextField control={control} name="name" label={t('name')} required maxLength={255} placeholder={t('dimensionNamePlaceholder')} />
                        </Col>
                    </Row>
                    <SwitchField control={control} name="is_required" label={t('dimensionRequired')} hint={t('dimensionRequiredHint')} />
                    <SwitchField control={control} name="active" label={t('active')} hint={t('dimensionActiveHint')} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="light" onClick={onClose}>{t('cancel')}</Button>
                    <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Spinner size="sm" className="me-2" />}{t('save')}</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

/** All dimensions as cards: values count, required, status. `?new=1` opens the create dialog. */
export function DimensionList() {
    const {t} = useSmartTranslation();
    const navigate = useNavigate();
    const [search, setSearch] = useSearchParams();
    const {data, error, mutate} = dimensionApi.useDimensions();
    const creating = search.get("new") === "1";
    const closeCreate = () => setSearch(prev => {
        prev.delete("new");
        return prev;
    }, {replace: true});

    if (error) {
        return <ConditionalError error={error} />;
    }
    if (!data) {
        return <Loading />;
    }

    return (
        <Page>
            <Card className="card-border mb-3 dimension-intro">
                <Card.Body className="d-flex flex-wrap align-items-center gap-3">
                    <div className="flex-grow-1" style={{minWidth: 260}}>
                        <h5 className="mb-1">{t('dimensionsTitle')}</h5>
                        <p className="text-muted mb-0 small">{t('dimensionsLead')}</p>
                    </div>
                    <ActionButton action="create" onClick={() => setSearch({new: "1"})}><Plus size={16} className="me-1" />{t('newDimension')}</ActionButton>
                </Card.Body>
            </Card>

            {data.length === 0 ? (
                <Card className="card-border text-center p-5">
                    <p className="text-muted mb-1">{t('noDimensionsYet')}</p>
                    <p className="small text-muted">{t('noDimensionsExample')}</p>
                </Card>
            ) : (
                <Row className="g-3">
                    {data.map(dimension => {
                        const values = dimension.values ?? [];
                        const postable = values.filter(v => v.status === "active" && v.allow_transaction).length;
                        return (
                            <Col key={dimension.id} md={6} xl={4}>
                                <Card className={`card-border h-100 dimension-card ${dimension.status !== "active" ? "opacity-50" : ""}`}
                                    role="button" onClick={() => navigate(dimensionPath(dimension.id))}>
                                    <Card.Body>
                                        <div className="d-flex align-items-start gap-2 mb-2">
                                            <span className="dimension-card-icon"><Tag size={16} /></span>
                                            <div className="flex-grow-1 min-w-0">
                                                <h6 className="mb-0 text-truncate">{dimension.name}</h6>
                                                <div className="small text-muted">{dimension.code}</div>
                                            </div>
                                            <ChevronRight size={18} className="text-muted" />
                                        </div>
                                        <div className="d-flex flex-wrap gap-2 small">
                                            <StatusBadge status={dimension.status} />
                                            {dimension.is_required && <Badge bg="light" className="badge-soft-warning">{t('requiredOnPosting')}</Badge>}
                                            <span className="text-muted">{t('dimensionValueCount', {count: values.length, postable})}</span>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            )}

            {creating && <DimensionModal dimension={null} onClose={closeCreate}
                onSaved={(saved) => { void mutate(); navigate(dimensionPath(saved.id), {replace: true}); }} />}
        </Page>
    );
}

type ValueForm = Omit<DimensionValueRequest, "status"> & {active: boolean};

/** Create / edit a value: code, name, parent (a group), group or postable, sequence. */
function ValueModal({dimension, value, parentId, onClose, onSaved}: {
    dimension: Dimension, value: DimensionValue | null, parentId: number | null, onClose: () => void, onSaved: () => void,
}) {
    const {t} = useSmartTranslation();
    const notify = useNotification();
    const {control, handleSubmit, setError, watch, setValue, formState: {isSubmitting}} = useForm<ValueForm>({
        defaultValues: {
            dimension_id: dimension.id,
            parent_id: value?.parent_id ?? parentId,
            code: value?.code ?? "",
            name: value?.name ?? "",
            is_group: value?.is_group ?? false,
            allow_transaction: value?.allow_transaction ?? true,
            sequence: value?.sequence ?? 0,
            active: (value?.status ?? "active") === "active",
        },
    });
    const isGroup = watch("is_group");

    // a group is a heading: by default nothing is posted to it directly
    useEffect(() => {
        if (isGroup && !value) {
            setValue("allow_transaction", false);
        }
    }, [isGroup, value, setValue]);

    // a value can't sit under itself or its own children
    const below = new Set<number>();
    if (value) {
        const collect = (id: number) => (dimension.values ?? []).filter(v => v.parent_id === id).forEach(v => {
            below.add(v.id);
            collect(v.id);
        });
        below.add(value.id);
        collect(value.id);
    }
    const parentOptions = valueTree((dimension.values ?? []).filter(v => v.is_group && !below.has(v.id)))
        .map(({value: v, depth}) => ({value: v.id, label: `${"— ".repeat(depth)}${v.code} · ${v.name}`}));

    const submit = handleSubmit(async ({active, ...values}) => {
        const data = {...values, sequence: Number(values.sequence) || 0, status: active ? "active" : "inactive"};
        try {
            if (value) {
                await dimensionApi.editValue(value.id, data);
            } else {
                await dimensionApi.addValue(data);
            }
            notify.success(t('saved'));
            onSaved();
        } catch (e) {
            applyServerErrors(e, setError, ["code", "name", "parent_id"]);
            notify.error(e);
        }
    });

    return (
        <Modal show onHide={onClose} centered>
            <Form noValidate onSubmit={submit}>
                <Modal.Header closeButton>
                    <Modal.Title as="h5">{value ? t('editDimensionValue', {dimension: dimension.name}) : t('newDimensionValue', {dimension: dimension.name})}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row className="gx-3">
                        <Col sm={4}>
                            <TextField control={control} name="code" label={t('code')} required maxLength={50} />
                        </Col>
                        <Col sm={8}>
                            <TextField control={control} name="name" label={t('name')} required maxLength={255} />
                        </Col>
                        <Col sm={8}>
                            <SelectField control={control} name="parent_id" label={t('parentGroup')} numeric placeholder={t('topLevel')} options={parentOptions}
                                hint={t('parentGroupHint')} />
                        </Col>
                        <Col sm={4}>
                            <TextField control={control} name="sequence" label={t('sequence')} type="number" numeric step="1" />
                        </Col>
                    </Row>
                    <SwitchField control={control} name="is_group" label={t('dimensionValueIsGroup')} hint={t('dimensionValueIsGroupHint')} />
                    <SwitchField control={control} name="allow_transaction" label={t('allowTransaction')} hint={t('allowTransactionHint')} />
                    <SwitchField control={control} name="active" label={t('active')} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="light" onClick={onClose}>{t('cancel')}</Button>
                    <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Spinner size="sm" className="me-2" />}{t('save')}</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

/** One dimension: its settings and the values tree (add, edit, nest under groups). */
export function DimensionDetail() {
    const {t} = useSmartTranslation();
    const {id} = useParams();
    const {data, error, mutate} = dimensionApi.useDimensions();
    const [editing, setEditing] = useState(false);
    const [valueModal, setValueModal] = useState<{value: DimensionValue | null, parentId: number | null} | null>(null);
    const [showInactive, setShowInactive] = useState(false);

    if (error) {
        return <ConditionalError error={error} />;
    }
    if (!data) {
        return <Loading />;
    }
    const dimension = data.find(d => String(d.id) === id);
    if (!dimension) {
        return <Page><Card className="card-border p-4 text-center text-muted">{t('notFound')} <Link to={DIMENSION_LIST_PATH}>{t('back')}</Link></Card></Page>;
    }

    const rows = valueTree((dimension.values ?? []).filter(v => showInactive || v.status === "active"));
    const inactiveCount = (dimension.values ?? []).filter(v => v.status !== "active").length;

    return (
        <Page>
            <Card className="card-border mb-3">
                <Card.Body className="d-flex flex-wrap align-items-center gap-3">
                    <span className="dimension-card-icon"><Tag size={18} /></span>
                    <div className="flex-grow-1 min-w-0">
                        <h5 className="mb-1">{dimension.name} <span className="text-muted fw-normal fs-6">{dimension.code}</span></h5>
                        <div className="d-flex flex-wrap gap-2 small">
                            <StatusBadge status={dimension.status} />
                            {dimension.is_required
                                ? <Badge bg="light" className="badge-soft-warning">{t('requiredOnPosting')}</Badge>
                                : <span className="text-muted">{t('optionalOnDocuments')}</span>}
                        </div>
                    </div>
                    <ActionButton action="edit" variant="outline-secondary" size="sm" onClick={() => setEditing(true)}><Edit2 size={14} className="me-1" />{t('edit')}</ActionButton>
                    <ActionButton action="create" size="sm" onClick={() => setValueModal({value: null, parentId: null})}><Plus size={14} className="me-1" />{t('addValue')}</ActionButton>
                </Card.Body>
            </Card>

            <Card className="card-border">
                <Card.Header className="d-flex align-items-center gap-2">
                    <span className="fw-semibold">{t('dimensionValues')}</span>
                    <span className="small text-muted">{t('dimensionValuesHint')}</span>
                    {inactiveCount > 0 && (
                        <Form.Check type="switch" id="show-inactive-values" className="ms-auto small" label={t('showInactiveCount', {count: inactiveCount})}
                            checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />
                    )}
                </Card.Header>
                {rows.length === 0 ? (
                    <Card.Body className="text-center text-muted py-5">
                        <p className="mb-2">{t('noDimensionValuesYet')}</p>
                        <ActionButton action="create" size="sm" variant="outline-primary" onClick={() => setValueModal({value: null, parentId: null})}><Plus size={14} className="me-1" />{t('addValue')}</ActionButton>
                    </Card.Body>
                ) : (
                    <div className="table-responsive">
                        <Table hover className="mb-0 align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>{t('value')}</th>
                                    <th>{t('type')}</th>
                                    <th className="text-end" style={{width: 90}}>{t('sequence')}</th>
                                    <th style={{width: 100}}>{t('status')}</th>
                                    <th style={{width: 150}} />
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map(({value, depth}) => (
                                    <tr key={value.id} className={value.status !== "active" ? "text-muted" : undefined}>
                                        <td style={{paddingLeft: `${0.75 + depth * 1.5}rem`}}>
                                            <span className="d-inline-flex align-items-center gap-2">
                                                {value.is_group ? <Folder size={14} className="text-primary" /> : depth > 0 ? <CornerDownRight size={14} className="text-muted" /> : <span style={{width: 14}} />}
                                                <span className="text-muted small">{value.code}</span>
                                                <span className={value.is_group ? "fw-semibold" : undefined}>{value.name}</span>
                                            </span>
                                        </td>
                                        <td className="small">
                                            {value.is_group && <Badge bg="light" className="badge-soft-primary me-1">{t('groupValue')}</Badge>}
                                            {value.allow_transaction
                                                ? <Badge bg="light" className="badge-soft-success">{t('usableOnDocuments')}</Badge>
                                                : <Badge bg="light" className="badge-soft-secondary">{t('reportingOnly')}</Badge>}
                                        </td>
                                        <td className="text-end">{value.sequence}</td>
                                        <td><StatusBadge status={value.status} /></td>
                                        <td className="text-end text-nowrap">
                                            {value.is_group && (
                                                <ActionButton action="create" variant="link" size="sm" className="p-0 me-3" onClick={() => setValueModal({value: null, parentId: value.id})}>
                                                    <Plus size={13} /> {t('addUnder')}
                                                </ActionButton>
                                            )}
                                            <ActionButton action="edit" variant="link" size="sm" className="p-0" onClick={() => setValueModal({value, parentId: value.parent_id})}>{t('edit')}</ActionButton>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                )}
            </Card>

            {editing && <DimensionModal dimension={dimension} onClose={() => setEditing(false)} onSaved={() => { setEditing(false); void mutate(); }} />}
            {valueModal && <ValueModal dimension={dimension} value={valueModal.value} parentId={valueModal.parentId}
                onClose={() => setValueModal(null)} onSaved={() => { setValueModal(null); void mutate(); }} />}
        </Page>
    );
}
