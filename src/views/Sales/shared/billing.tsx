import {ReactNode} from "react";
import {Col, Form, Row, Table} from "react-bootstrap";
import {Package, Send} from "react-feather";
import {Control, Controller, FieldValues, Path, useWatch} from "react-hook-form";
import Swal from "sweetalert2";
import {SelectField} from "@/components/FormField/FormFields";
import type {EinvoiceTransType} from "@/apis/models/einvoice";
import {einvoiceDocumentApi} from "@/apis/requests/einvoice-api";
import {EinvoiceReadiness, useModeDescription} from "@/views/Einvoice/shared/EinvoiceReadiness";
import {LineNumberInput} from "@/views/Inventory/shared/document";
import {formatDecimal} from "@/views/Inventory/shared/options";
import {RequestError} from "@/lib/request-util/exception";
import {useSmartTranslation} from "@/hooks/use-translation";
import type {LineTotals} from "./tax";
import {DocCard} from "./DocCard";
import {LinesFooter} from "./EntryLayout";

type EinvoiceSectionProps<T extends FieldValues> = {
    control: Control<T>,
    readOnly?: boolean,
    transType: EinvoiceTransType,
    // the customer when it isn't a field of this form (e.g. invoicing a delivery note); otherwise read from customer_id
    customerId?: number | null,
    // saved document: checked in full
    transId?: number | null,
};

/**
 * MyInvois (LHDN e-invoice) options of an invoice / credit note: when it is submitted
 * (Immediate within minutes, Scheduled in the daily window, On hold waits for the Submit
 * button) and whether anything would stop LHDN from accepting it.
 */
export function EinvoiceSection<T extends FieldValues>({control, readOnly, transType, customerId, transId}: EinvoiceSectionProps<T>) {
    const {t} = useSmartTranslation();
    const [watchedCustomer, mode] = useWatch({control, name: ["customer_id", "einvoice_submission_mode"] as Path<T>[]});
    const partyId = customerId ?? (watchedCustomer as number | null | undefined);
    const {data: readiness} = einvoiceDocumentApi.useReadiness(transType, partyId, transId);
    const describe = useModeDescription();
    const modeHint = readiness?.enabled ? describe(mode as "S" | "I" | "H" | null, readiness.scheduled_time, readiness.auto_submit) : null;

    return (
        <DocCard icon={Send} title={t('myInvois')} hint={t('myInvoisHint')}>
            <Row className="gx-4">
                <Col md={6}>
                    <SelectField
                        control={control}
                        name={"einvoice_submission_mode" as Path<T>}
                        label={t('submissionMode')}
                        placeholder=""
                        disabled={readOnly}
                        hint={modeHint ?? undefined}
                        options={[
                            {value: "S", label: t('submissionMode_S')},
                            {value: "I", label: t('submissionMode_I')},
                            {value: "H", label: t('submissionMode_H')},
                        ]}
                    />
                </Col>
                <Col md={6}>
                    <div className="doc-field-caption">{t('status')}</div>
                    <EinvoiceReadiness transType={transType} partyId={partyId} transId={transId} />
                </Col>
            </Row>
        </DocCard>
    );
}

/** MyInvois card of a self-billed invoice / credit note: these follow the company's self-billed mode. */
export function SelfBilledEinvoiceSection({transType, supplierId, transId}: {transType: EinvoiceTransType, supplierId: number | null | undefined, transId?: number | null}) {
    const {t} = useSmartTranslation();
    const {data: readiness} = einvoiceDocumentApi.useReadiness(transType, supplierId, transId);
    const describe = useModeDescription();

    return (
        <DocCard icon={Send} title={t('myInvois')} hint={t('einvSelfBilledCardHint')}>
            <Row className="gx-4">
                {readiness?.enabled && (
                    <Col md={6}>
                        <div className="doc-field-caption">{t('submissionMode')}</div>
                        <div className="fw-semibold text-dark">{t(`einvMode_${readiness.default_mode}`)}</div>
                        <div className="small text-muted mb-3">{describe(readiness.default_mode, readiness.scheduled_time, readiness.auto_submit)}</div>
                    </Col>
                )}
                <Col md={readiness?.enabled ? 6 : 12}>
                    <div className="doc-field-caption">{t('status')}</div>
                    <EinvoiceReadiness transType={transType} partyId={supplierId} transId={transId} />
                </Col>
            </Row>
        </DocCard>
    );
}

/** A line of the document being invoiced / credited. */
export type SourceRow = {
    // the source line's id (src_id)
    id: number,
    code: string,
    description: string,
    uom: string | null,
    // quantity on the source line
    sourceQty: number,
    // already invoiced / credited by other documents
    before: number,
    // most this document can take
    available: number,
    unitPrice: number,
    discountPercent: number,
};

type SourceLinesTableProps<T extends FieldValues> = {
    control: Control<T>,
    rows: SourceRow[],
    lineTotals: LineTotals[],
    // column headings: e.g. "Delivered" / "Invoiced before" / "This invoice"
    sourceLabel: string,
    beforeLabel: string,
    thisLabel: string,
    taxIncluded: boolean,
    readOnly?: boolean,
    // totals panel under the grid
    totals?: ReactNode,
};

/** Rows of the source document with "this document" quantities, capped at what is left. */
export function SourceLinesTable<T extends FieldValues>({control, rows, lineTotals, sourceLabel, beforeLabel, thisLabel, taxIncluded, readOnly, totals}: SourceLinesTableProps<T>) {
    const {t} = useSmartTranslation();

    return (
        <>
            <div className="table-responsive">
                <Table className="mb-0 sales-lines">
                    <thead className="table-light">
                        <tr>
                            <th className="doc-line-no">#</th>
                            <th style={{minWidth: 240}}>{t('item')}</th>
                            <th className="text-end" style={{width: 100}}>{sourceLabel}</th>
                            <th className="text-end" style={{width: 110}}>{beforeLabel}</th>
                            <th className="text-end" style={{width: 140}}>{thisLabel}</th>
                            <th style={{width: 60}}>{t('unit')}</th>
                            <th className="text-end" style={{width: 120}}>{taxIncluded ? t('priceInclTax') : t('price')}</th>
                            <th className="text-end" style={{width: 120}}>{t('amount')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, index) => (
                            <tr key={row.id}>
                                <td className="doc-line-no">{index + 1}</td>
                                <td>
                                    <div className="fw-semibold text-dark">{row.code}</div>
                                    <div className="small text-muted">{row.description}</div>
                                </td>
                                <td className="text-end">{formatDecimal(row.sourceQty)}</td>
                                <td className="text-end text-muted">{formatDecimal(row.before)}</td>
                                <td>
                                    <LineNumberInput
                                        control={control}
                                        name={`lines.${index}.quantity` as Path<T>}
                                        min={0}
                                        disabled={readOnly}
                                        validate={(v) => v < 0 ? t('valueMustNotBeNegative') : v > row.available + 0.00005 ? t('maxAvailable', {qty: formatDecimal(row.available)}) : true}
                                    />
                                </td>
                                <td className="text-muted">{row.uom ?? "-"}</td>
                                <td className="text-end">{formatDecimal(row.unitPrice)}{row.discountPercent > 0 && <div className="small text-muted">−{formatDecimal(row.discountPercent)}%</div>}</td>
                                <td className="text-end sales-line-amount">{formatDecimal(lineTotals[index]?.line_total ?? 0)}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
            <LinesFooter totals={totals} />
        </>
    );
}

/** The server's 422 message for a field, if that's what failed. */
export function serverFieldError(error: unknown, field: string): string | undefined {
    if (!(error instanceof RequestError)) {
        return undefined;
    }
    const errors = (error.requestException as unknown as {errors?: Record<string, string[]>}).errors ?? {};
    return errors[field]?.[0];
}

/**
 * Sends once; if the server says the customer would go over the credit limit, asks the
 * user and — on yes — sends again with the go-ahead.
 */
export async function sendWithCreditLimitCheck<R>(send: (confirmOverLimit: boolean) => Promise<R>, labels: {title: string, confirm: string, cancel: string}): Promise<R> {
    try {
        return await send(false);
    } catch (error) {
        const message = serverFieldError(error, "credit_limit");
        if (!message) {
            throw error;
        }
        const answer = await Swal.fire({
            title: labels.title,
            text: message,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: labels.confirm,
            cancelButtonText: labels.cancel,
        });
        if (!answer.isConfirmed) {
            throw error;
        }
        return send(true);
    }
}

type ReturnedGoodsCardProps<T extends FieldValues> = {
    control: Control<T>,
    // the credit_type currently chosen
    creditType: string | null | undefined,
    locationOptions: {value: number, label: string}[],
    className?: string,
};

/** Credit notes with stock items: goods back into a location, or written off. */
export function ReturnedGoodsCard<T extends FieldValues>(props: ReturnedGoodsCardProps<T>) {
    // react-hook-form can't resolve paths on an open generic, so work on the credit note's field names
    const {control, creditType, locationOptions, className} = props as unknown as ReturnedGoodsCardProps<{credit_type: string | null, inventory_location_id: number | null}>;
    const {t} = useSmartTranslation();

    return (
        <DocCard icon={Package} title={t('returnedGoods')} className={className}>
            <Row className="gx-4">
                <Col md={6}>
                    <Controller
                        control={control}
                        name="credit_type"
                        render={({field}) => (
                            <div className="mb-3">
                                <Form.Check type="radio" id="credit-type-return" checked={field.value === "return"} onChange={() => field.onChange("return")}
                                    label={<><span className="fw-semibold">{t('creditTypeReturn')}</span><div className="small text-muted">{t('creditTypeReturnHint')}</div></>} />
                                <Form.Check type="radio" id="credit-type-write-off" className="mt-2" checked={field.value === "write_off"} onChange={() => field.onChange("write_off")}
                                    label={<><span className="fw-semibold">{t('creditTypeWriteOff')}</span><div className="small text-muted">{t('creditTypeWriteOffHint')}</div></>} />
                            </div>
                        )}
                    />
                </Col>
                <Col md={6}>
                    {creditType === "return" && (
                        <SelectField control={control} name="inventory_location_id" label={t('returnTo')} options={locationOptions} numeric required placeholder="" />
                    )}
                </Col>
            </Row>
        </DocCard>
    );
}
