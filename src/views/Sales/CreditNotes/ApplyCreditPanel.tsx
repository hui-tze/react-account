import {useMemo} from "react";
import {Button, Spinner} from "react-bootstrap";
import {useWatch} from "react-hook-form";
import {useRequestForm} from "@/hooks/use-request-handler";
import {CustomerTransDocument, OpenItem} from "@/apis/models/sales-document";
import {allocateCredit, useGetCustomerOpenItems} from "@/apis/requests/sales-billing-api";
import {useSmartTranslation} from "@/hooks/use-translation";
import {AllocationTable, appliedTotal, toAllocations} from "../shared/AllocationTable";
import {roundMoney} from "../shared/tax";

type ApplyCreditPanelProps = {
    credit: CustomerTransDocument,
    onApplied: () => Promise<void>,
};

/** Applies an unapplied credit note to the customer's open invoices (replacing where it was applied). */
export function ApplyCreditPanel({credit, onApplied}: ApplyCreditPanelProps) {
    const {data: openItems, mutate} = useGetCustomerOpenItems(credit.customer_id, {revalidateOnFocus: false});

    // open invoices, plus the ones this credit already settles — its own share counts as open
    const rows: OpenItem[] = useMemo(() => {
        const own = new Map((credit.allocations ?? []).map(a => [a.id, Number(a.amount)]));
        const list = (openItems?.invoices ?? []).map(item => ({...item, open: roundMoney(item.open + (own.get(item.id) ?? 0))}));
        (credit.allocations ?? []).forEach(a => {
            if (!list.some(item => item.id === a.id)) {
                list.push({id: a.id, trans_type: a.type, reference_no: a.reference_no, trans_date: a.date ?? "", due_date: a.due_date,
                    grand_total: Number(a.grand_total), allocated_total: 0, open: Number(a.amount)});
            }
        });
        return list;
    }, [openItems, credit]);

    // remount the form when the rows arrive so the current applications show
    return openItems
        ? <ApplyForm key={rows.map(r => r.id).join(",")} credit={credit} rows={rows} onApplied={async () => {
            await mutate();
            await onApplied();
        }} />
        : <div className="loader-pendulums my-3" />;
}

function ApplyForm({credit, rows, onApplied}: {credit: CustomerTransDocument, rows: OpenItem[], onApplied: () => Promise<void>}) {
    const {t} = useSmartTranslation();
    const own = new Map((credit.allocations ?? []).map(a => [a.id, Number(a.amount)]));

    const {control, setValue, setError, submitting, handleSubmitRequest} = useRequestForm<{pay: (number | null)[]}>({
        formOptions: {defaultValues: {pay: rows.map(row => own.get(row.id) ?? 0)}},
    });
    const pay = useWatch({control, name: "pay"});
    const available = Number(credit.grand_total);
    const applied = appliedTotal(pay);

    const submit = async (values: {pay: (number | null)[]}) => {
        if (applied > available + 0.005) {
            setError("pay", {type: "manual", message: t('appliedMoreThanCredit')});
            throw new Error(t('appliedMoreThanCredit'));
        }
        await allocateCredit(credit.id, toAllocations(rows, values.pay));
    };

    return (
        <form noValidate onSubmit={handleSubmitRequest({request: submit, onSuccess: onApplied})}>
            <AllocationTable control={control} setValue={setValue} rows={rows} available={available} pay={pay}
                sources={[{label: t('creditTotal'), amount: available}]} className="mb-3"
                hint={t('applyCreditHint')} emptyText={t('noOpenInvoicesCredit')} />
            <Button type="submit" variant="primary" disabled={submitting || rows.length === 0}>
                <Spinner as="span" animation="border" size="sm" className={submitting ? "me-2" : "d-none"} />
                {t('saveApplications')}
            </Button>
        </form>
    );
}
