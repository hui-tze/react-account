import {ComponentType, ReactNode, useState} from "react";
import classNames from "classnames";
import {ChevronDown} from "react-feather";
import {formatDecimal} from "@/views/Inventory/shared/options";

type DocCardProps = {
    title: string,
    icon?: ComponentType<{size?: number | string, className?: string}>,
    hint?: string,
    // buttons on the right of the header
    actions?: ReactNode,
    children: ReactNode,
    // collapsible cards show `summary` in the header while closed
    collapsible?: boolean,
    defaultOpen?: boolean,
    // keep a collapsible card open (e.g. a field inside it has an error)
    forceOpen?: boolean,
    summary?: ReactNode,
    className?: string,
    bodyClassName?: string,
};

/** One titled section of a sales document form. */
export function DocCard({title, icon: Icon, hint, actions, children, collapsible, defaultOpen = true, forceOpen, summary, className, bodyClassName}: DocCardProps) {
    const [open, setOpen] = useState(defaultOpen);
    const shown = !collapsible || open || !!forceOpen;

    const heading = (
        <div className="d-flex align-items-center gap-2 min-w-0">
            {Icon && <span className="sales-doc-card-icon"><Icon size={16} /></span>}
            <div className="min-w-0">
                <div className="sales-doc-card-title">{title}</div>
                {!shown && summary ? <div className="sales-doc-card-summary text-truncate">{summary}</div>
                    : hint && <div className="sales-doc-card-hint">{hint}</div>}
            </div>
        </div>
    );

    return (
        <div className={classNames("card card-border sales-doc-card", className)}>
            <div className="sales-doc-card-header">
                {collapsible ? (
                    <button type="button" className="sales-doc-card-toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
                        {heading}
                        <ChevronDown size={18} className={classNames("sales-doc-card-chevron", {open: shown})} />
                    </button>
                ) : heading}
                {actions && <div className="ms-auto d-flex gap-2 flex-shrink-0">{actions}</div>}
            </div>
            {shown && <div className={classNames("sales-doc-card-body", bodyClassName)}>{children}</div>}
        </div>
    );
}

/** Document total for the pinned save bar. */
export function DocTotal({amount, currencyCode, label}: {amount: number, currencyCode?: string, label: string}) {
    return (
        <>
            <span className="small">{label}</span>
            <span className="fs-5 fw-bold text-dark">{currencyCode ? `${currencyCode} ` : ""}{formatDecimal(amount)}</span>
        </>
    );
}

/** Label / value pairs inside a card, e.g. the document a new one is created from. */
export function FactsGrid({facts}: {facts: {label: string, value: ReactNode}[]}) {
    return (
        <div className="row g-3">
            {facts.filter(f => f.value).map(fact => (
                <div key={fact.label} className="col-sm-6">
                    <div className="small text-muted">{fact.label}</div>
                    <div className="fw-semibold text-dark">{fact.value}</div>
                </div>
            ))}
        </div>
    );
}
