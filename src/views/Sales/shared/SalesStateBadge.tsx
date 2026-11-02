import {Badge} from "react-bootstrap";
import {useSmartTranslation} from "@/hooks/use-translation";

// derived states of every sales document -> badge tint
const TINTS: Record<string, string> = {
    open: "badge-soft-primary",
    partially_converted: "badge-soft-warning",
    partially_delivered: "badge-soft-warning",
    partially_invoiced: "badge-soft-warning",
    partially_paid: "badge-soft-warning",
    converted: "badge-soft-success",
    delivered: "badge-soft-info",
    invoiced: "badge-soft-success",
    completed: "badge-soft-success",
    paid: "badge-soft-success",
    allocated: "badge-soft-success",
    unallocated: "badge-soft-warning",
    overdue: "badge-soft-danger",
    outstanding: "badge-soft-primary",
    partially_received: "badge-soft-warning",
    received: "badge-soft-info",
    unbilled: "badge-soft-primary",
    partially_billed: "badge-soft-warning",
    billed: "badge-soft-success",
    unpaid: "badge-soft-primary",
    partially_allocated: "badge-soft-warning",
    expired: "badge-soft-secondary",
    closed: "badge-soft-secondary",
    cancelled: "badge-soft-danger",
    voided: "badge-soft-danger",
};

export function SalesStateBadge({state}: {state: string}) {
    const {t} = useSmartTranslation();

    return (
        <Badge bg="light" className={TINTS[state] ?? "badge-soft-secondary"}>
            {t(`salesState_${state}`)}
        </Badge>
    );
}
