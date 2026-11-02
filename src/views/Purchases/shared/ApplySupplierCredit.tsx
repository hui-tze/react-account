import {useMemo} from "react";
import {Button, Spinner} from "react-bootstrap";
import {useWatch} from "react-hook-form";
import {useRequestForm} from "@/hooks/use-request-handler";
import {SupplierOpenItem, SupplierTransDocument} from "@/apis/models/purchase-document";
import {allocateSupplierCredit, useGetSupplierOpenItems} from "@/apis/requests/purchase-api";
import {useSmartTranslation} from "@/hooks/use-translation";
import {AllocationTable, appliedTotal, toAllocations} from "@/views/Sales/shared/AllocationTable";
import {roundMoney} from "@/views/Sales/shared/tax";

/** The supplier's open bills, plus the ones `credit` already settles — its own share counts as open. */
export function useBillRows(supplierId: number | null | undefined, credit?: SupplierTransDocument) {
    const {data: openItems, mutate} = useGetSupplierOpenItems(supplierId, {revalidateOnFocus: false});

    const rows: SupplierOpenItem[] = useMemo(() => {
        const own = new Map((credit?.allocations ?? []).map(a => [a.id, Number(a.amount)]));
        const list = (openItems?.invoices ?? []).map(item => ({...item, open: roundMoney(item.open + (own.get(item.id) ?? 0))}));
        (credit?.allocations ?? []).forEach(a => {
            if (!list.some(item => item.id === a.id)) {
                list.push({id: a.id, trans_type: a.type, reference_no: a.reference_no, supplier_invoice_no: a.supplier_invoice_no, trans_date: a.date ?? "", due_date: a.due_date,
                    grand_total: Number(a.grand_total), allocated_total: 0, open: Number(a.amount)});
            }
        });
        return list;
    }, [openItems, credit]);

    return {rows, openItems, mutate};
}

/** How much a supplier credit can give: payments also settle with their discount. */
export const creditCapacity = (credit: SupplierTransDocument) =>
    roundMoney(Number(credit.grand_total) + (credit.trans_type === "supplier_payment" ? Number(credit.discount_total) : 0));

type ApplySupplierCreditProps = {
    credit: SupplierTransDocument,
    onApplied: () => Promise<void>,
};

/** Applies a supplier payment / credit note to the supplier's open bills (replacing where it was applied). */
export function ApplySupplierCredit({credit, onApplied}: ApplySupplierCreditProps) {
    const {rows, openItems, mutate} = useBillRows(credit.supplier_id, credit);

    // remount the form when the rows arrive so the current applications show
    return openItems
        ? <ApplyForm key={`${credit.id}|${rows.map(r => r.id).join(",")}`} credit={credit} rows={rows} onApplied={async () => {
            await mutate();
            await onApplied();
        }} />
        : <div className="loader-pendulums my-3" />;
}

function ApplyForm({credit, rows, onApplied}: {credit: SupplierTransDocument, rows: SupplierOpenItem[], onApplied: () => Promise<void>}) {
    const {t} = useSmartTranslation();
    const own = new Map((credit.allocations ?? []).map(a => [a.id, Number(a.amount)]));

    const {control, setValue, setError, submitting, handleSubmitRequest} = useRequestForm<{pay: (number | null)[]}>({
        formOptions: {defaultValues: {pay: rows.map(row => own.get(row.id) ?? 0)}},
    });
    const pay = useWatch({control, name: "pay"});
    const available = creditCapacity(credit);
    const applied = appliedTotal(pay);

    const submit = async (values: {pay: (number | null)[]}) => {
        if (applied > available + 0.005) {
            setError("pay", {type: "manual", message: t('appliedMoreThanCredit')});
            throw new Error(t('appliedMoreThanCredit'));
        }
        await allocateSupplierCredit(credit.id, toAllocations(rows, values.pay));
    };

    return (
        <form noValidate onSubmit={handleSubmitRequest({request: submit, onSuccess: onApplied})}>
            <AllocationTable control={control} setValue={setValue} rows={rows} available={available} party="supplier" pay={pay}
                sources={[{label: credit.trans_type === "supplier_payment" ? t('amountPaid') : t('creditTotal'), amount: available}]} className="mb-3"
                hint={t('applyToBillsHint')} emptyText={t('noOpenBills')} />
            <Button type="submit" variant="primary" disabled={submitting || rows.length === 0}>
                <Spinner as="span" animation="border" size="sm" className={submitting ? "me-2" : "d-none"} />
                {t('saveApplications')}
            </Button>
        </form>
    );
}
