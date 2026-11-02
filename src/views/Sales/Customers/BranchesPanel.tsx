import {Table} from "react-bootstrap";
import {MapPin, Plus} from "react-feather";
import {Link, useNavigate} from "react-router-dom";
import {Customer} from "@/apis/models/customer";
import {useGetSalesTypeOptions} from "@/apis/requests/sales-type-api";
import {useGetTaxGroupOptions} from "@/apis/requests/tax-group-api";
import {FormSectionTitle} from "@/views/Settings/shared/SettingsFormPage";
import {StatusBadge} from "@/views/Settings/shared/StatusBadge";
import {useSmartTranslation} from "@/hooks/use-translation";
import {branchPath} from "../sales-menu";

/** The customer's branches (where documents are addressed), each opening its own form. */
export function BranchesPanel({customer}: {customer: Customer}) {
    const {t} = useSmartTranslation();
    const navigate = useNavigate();
    const {data: salesTypes} = useGetSalesTypeOptions();
    const {data: taxGroups} = useGetTaxGroupOptions();
    const nameOf = (rows: {id: number, name: string}[] | undefined, id: number | null) =>
        (id != null ? rows?.find(r => r.id === id)?.name : undefined) ?? "-";

    return (
        <>
            <hr className="my-3" />
            <div className="d-flex align-items-start justify-content-between">
                <FormSectionTitle title={t('branches')} hint={t('branchesHint')} />
                <Link to={branchPath(customer.id)} className="btn btn-outline-primary btn-sm">
                    <Plus size={14} className="me-1" />{t('addBranch')}
                </Link>
            </div>
            <div className="table-responsive mb-3">
                <Table hover className="align-middle mb-0">
                    <thead className="table-light">
                        <tr>
                            <th>{t('branch')}</th>
                            <th>{t('priceList')}</th>
                            <th>{t('taxGroup')}</th>
                            <th>{t('deliveryAddress')}</th>
                            <th>{t('status')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(customer.branches ?? []).map(branch => {
                            const address = branch.addresses?.find(a => a.is_primary) ?? branch.addresses?.[0];
                            return (
                                <tr key={branch.id} role="button" onClick={() => navigate(branchPath(customer.id, branch.id))}>
                                    <td className="fw-semibold text-dark">{branch.name}</td>
                                    <td>{nameOf(salesTypes, branch.sales_type_id)}</td>
                                    <td>{nameOf(taxGroups, branch.tax_group_id)}</td>
                                    <td className="text-muted small">
                                        {address ? <><MapPin size={12} className="me-1" />{[address.address1, address.city].filter(Boolean).join(", ")}</> : "-"}
                                    </td>
                                    <td><StatusBadge status={branch.status} /></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </div>
        </>
    );
}
