import {useState} from "react";
import {Col, Container, Form, Row, Table} from "react-bootstrap";
import {Link2} from "react-feather";
import SimpleBar from "simplebar-react";
import {SupplierTransDocument} from "@/apis/models/purchase-document";
import {useGetUnallocatedSupplierCredits} from "@/apis/requests/purchase-api";
import {formatDecimal} from "@/views/Inventory/shared/options";
import {useSmartTranslation} from "@/hooks/use-translation";
import {DocCard} from "@/views/Sales/shared/DocCard";
import {useSupplierFilter} from "../shared/page-helpers";
import {ApplySupplierCredit} from "../shared/ApplySupplierCredit";

/** Payments and credit notes with money still unapplied: pick one and apply it to the supplier's bills. */
export default function SupplierAllocationPage() {
    const {t} = useSmartTranslation();
    const supplierFilter = useSupplierFilter();
    const [supplierId, setSupplierId] = useState<number | null>(null);
    const [selected, setSelected] = useState<number | null>(null);
    const {data: credits, mutate} = useGetUnallocatedSupplierCredits(supplierId);
    const credit: SupplierTransDocument | undefined = credits?.find(c => c.id === selected);

    return (
        <div className="app-body">
            <SimpleBar className="nicescroll-bar">
                <Container fluid className="py-3">
                    <Row className="g-2 mb-3 align-items-center">
                        <Col md={4}>
                            <Form.Select value={supplierId ?? ""} onChange={(e) => { setSupplierId(Number(e.target.value) || null); setSelected(null); }} aria-label={t('supplier')}>
                                <option value="">{supplierFilter.placeholder}</option>
                                {supplierFilter.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </Form.Select>
                        </Col>
                        <Col className="small text-muted">{t('supplierAllocationHint')}</Col>
                    </Row>

                    {!credits ? <div className="loader-pendulums my-3" /> : credits.length === 0 ? (
                        <p className="text-muted">{t('nothingToAllocate')}</p>
                    ) : (
                        <div className="table-responsive mb-3">
                            <Table hover className="mb-0 sales-lines">
                                <thead className="table-light">
                                    <tr>
                                        <th>{t('date')}</th>
                                        <th>{t('document')}</th>
                                        <th>{t('supplier')}</th>
                                        <th className="text-end">{t('total')}</th>
                                        <th className="text-end">{t('unapplied')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {credits.map(row => (
                                        <tr key={row.id} role="button" className={row.id === selected ? "table-active" : ""} onClick={() => setSelected(row.id)}>
                                            <td>{row.trans_date}</td>
                                            <td>
                                                <div className="fw-semibold text-dark">{row.reference_no}</div>
                                                <div className="small text-muted">{t(`docType_${row.trans_type}`)}</div>
                                            </td>
                                            <td>{row.supplier?.name ?? "-"}</td>
                                            <td className="text-end">{formatDecimal(row.grand_total)} <span className="small text-muted">{row.currency}</span></td>
                                            <td className="text-end fw-semibold">{formatDecimal(row.unallocated ?? 0)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}

                    {credit && (
                        <DocCard icon={Link2} title={t('applyDocument', {ref: credit.reference_no})} className="mb-0">
                            <ApplySupplierCredit credit={credit} onApplied={async () => {
                                setSelected(null);
                                await mutate();
                            }} />
                        </DocCard>
                    )}
                </Container>
            </SimpleBar>
        </div>
    );
}
