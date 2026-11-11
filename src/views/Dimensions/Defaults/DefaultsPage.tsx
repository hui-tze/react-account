import {useMemo, useState} from "react";
import {Card, Form, Nav, Spinner, Table} from "react-bootstrap";
import {Check} from "react-feather";
import {Link} from "@/components/Access/Guarded";
import SimpleBar from "simplebar-react";
import type {DimensionAssignable, DimensionTag} from "@/apis/models/dimension";
import {dimensionApi} from "@/apis/requests/dimension-api";
import {useGetCustomerOptions} from "@/apis/requests/customer-api";
import {useGetCustomerBranches} from "@/apis/requests/customer-branch-api";
import {useGetSupplierOptions} from "@/apis/requests/supplier-api";
import {useGetAllAccount} from "@/apis/requests/account-api";
import {useNotification} from "@/hooks/notification";
import {useSmartTranslation} from "@/hooks/use-translation";
import {DimensionValueSelect, useActiveDimensions, withValue} from "../shared/DimensionFields";
import {DIMENSION_LIST_PATH} from "../dimensions-menu";
import {useAccess} from "@/providers/access";

type Entity = {id: number, code: string | null, name: string};

const TABS: {type: DimensionAssignable, labelKey: string, hintKey: string}[] = [
    {type: "customer", labelKey: 'customers', hintKey: 'defaultsCustomerHint'},
    {type: "customer_branch", labelKey: 'customerBranches', hintKey: 'defaultsBranchHint'},
    {type: "supplier", labelKey: 'suppliers', hintKey: 'defaultsSupplierHint'},
    {type: "account", labelKey: 'accounts', hintKey: 'defaultsAccountHint'},
];

/** The records of one kind to set defaults on (branches: of the chosen customer). */
function useEntities(type: DimensionAssignable, customerId: number | null): Entity[] | undefined {
    const {data: customers} = useGetCustomerOptions();
    const {data: branches} = useGetCustomerBranches(type === "customer_branch" ? customerId : null);
    const {data: suppliers} = useGetSupplierOptions();
    const {data: accounts} = useGetAllAccount();

    return useMemo(() => {
        switch (type) {
            case "customer":
                return customers?.filter(c => c.status === "active").map(c => ({id: c.id, code: c.short_name, name: c.name}));
            case "customer_branch":
                return customerId ? branches?.filter(b => b.status === "active").map(b => ({id: b.id, code: b.short_name, name: b.name})) : [];
            case "supplier":
                return suppliers?.filter(s => s.status === "active").map(s => ({id: s.id, code: s.code, name: s.name}));
            case "account":
                return accounts?.filter(a => a.status === "active" && a.allow_transaction).map(a => ({id: a.id, code: a.account_code, name: a.account_name}));
            default:
                return [];
        }
    }, [type, customers, branches, suppliers, accounts, customerId]);
}

/**
 * Default dimension values of customers, branches, suppliers and accounts. Documents pick them
 * up when the customer / branch / supplier is chosen (branch over customer), journal and bank
 * lines when the account is chosen. Each change saves straight away.
 */
export function DefaultsPage() {
    const {t} = useSmartTranslation();
    const notify = useNotification();
    const [type, setType] = useState<DimensionAssignable>("customer");
    const [customerId, setCustomerId] = useState<number | null>(null);
    const [query, setQuery] = useState("");
    const [saving, setSaving] = useState<number | null>(null);
    const [savedId, setSavedId] = useState<number | null>(null);

    const {dimensions, isLoading} = useActiveDimensions();
    // each pick saves straight away: dimensions "edit"
    const canEdit = useAccess().canHere("edit");
    const {data: customers} = useGetCustomerOptions();
    const {data: defaults, mutate} = dimensionApi.useAllDefaults(type);
    const entities = useEntities(type, customerId);
    const tab = TABS.find(x => x.type === type)!;

    const q = query.trim().toLowerCase();
    const rows = (entities ?? []).filter(e => !q || e.name.toLowerCase().includes(q) || (e.code ?? "").toLowerCase().includes(q));

    const change = async (entityId: number, dimensionId: number, valueId: number | null) => {
        const tags: DimensionTag[] = withValue(defaults?.[entityId], dimensionId, valueId);
        setSaving(entityId);
        try {
            await dimensionApi.saveDefaults(type, entityId, tags);
            await mutate({...(defaults ?? {}), [entityId]: tags}, {revalidate: false});
            setSavedId(entityId);
        } catch (e) {
            notify.error(e);
        } finally {
            setSaving(null);
        }
    };

    return (
        <div className="app-body">
            <SimpleBar className="nicescroll-bar">
                <div className="container-fluid py-3">
                    <Card className="card-border">
                        <Card.Header className="pb-0 border-bottom-0">
                            <h5 className="mb-1">{t('menu_DefaultValues')}</h5>
                            <p className="small text-muted mb-3">{t('defaultsLead')}</p>
                            <Nav variant="tabs" activeKey={type} onSelect={(k) => { setType(k as DimensionAssignable); setQuery(""); setSavedId(null); }}>
                                {TABS.map(x => (
                                    <Nav.Item key={x.type}><Nav.Link eventKey={x.type}>{t(x.labelKey)}</Nav.Link></Nav.Item>
                                ))}
                            </Nav>
                        </Card.Header>
                        <Card.Body>
                            {!isLoading && dimensions.length === 0 ? (
                                <div className="text-center text-muted py-5">
                                    {t('noDimensionsYet')} <Link to={`${DIMENSION_LIST_PATH}?new=1`}>{t('newDimension')}</Link>
                                </div>
                            ) : (
                                <>
                                    <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                                        {type === "customer_branch" && (
                                            <Form.Select value={customerId ?? ""} onChange={(e) => setCustomerId(e.target.value ? Number(e.target.value) : null)} style={{maxWidth: 320}}
                                                aria-label={t('customer')}>
                                                <option value="">{t('pickCustomerFirst')}</option>
                                                {(customers ?? []).filter(c => c.status === "active").map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </Form.Select>
                                        )}
                                        <Form.Control type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('search')} style={{maxWidth: 280}} />
                                        <span className="small text-muted ms-auto">{t(tab.hintKey)}</span>
                                    </div>
                                    <div className="table-responsive">
                                        <Table className="mb-0 align-middle">
                                            <thead className="table-light">
                                                <tr>
                                                    <th style={{minWidth: 220}}>{t('name')}</th>
                                                    {dimensions.map(d => <th key={d.id} style={{minWidth: 200}}>{d.name}</th>)}
                                                    <th style={{width: 40}} />
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {!entities ? (
                                                    <tr><td colSpan={dimensions.length + 2}><div className="loader-pendulums my-4" /></td></tr>
                                                ) : rows.length === 0 ? (
                                                    <tr><td colSpan={dimensions.length + 2} className="text-center text-muted py-4">
                                                        {type === "customer_branch" && !customerId ? t('pickCustomerFirst') : t('noRecords')}
                                                    </td></tr>
                                                ) : rows.map(entity => (
                                                    <tr key={entity.id}>
                                                        <td>
                                                            {entity.code && <span className="text-muted small me-2">{entity.code}</span>}
                                                            {entity.name}
                                                        </td>
                                                        {dimensions.map(d => (
                                                            <td key={d.id}>
                                                                <DimensionValueSelect dimension={d} compact
                                                                    value={defaults?.[entity.id]?.find(x => x.dimension_id === d.id)?.dimension_value_id ?? null}
                                                                    disabled={saving === entity.id || !canEdit}
                                                                    onChange={(valueId) => void change(entity.id, d.id, valueId)} />
                                                            </td>
                                                        ))}
                                                        <td className="text-center">
                                                            {saving === entity.id ? <Spinner size="sm" /> : savedId === entity.id ? <Check size={16} className="text-success" /> : null}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                </>
                            )}
                        </Card.Body>
                    </Card>
                </div>
            </SimpleBar>
        </div>
    );
}
