import {ComponentType, CSSProperties, ReactNode, useState} from "react";
import {formatDate, isIsoDate} from "@/utils/display-format";
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
    // body without padding: a line grid running edge to edge
    flush?: boolean,
    // follow-on of the section before it, numbered "2b" instead of taking a number
    sub?: boolean,
};

/**
 * One titled section of a document form. Inside a document entry (`.doc-entry`) the
 * sections number themselves: "1 · Customer", "2 · Details"…
 */
export function DocCard({title, icon: Icon, hint, actions, children, collapsible, defaultOpen = true, forceOpen, summary, className, bodyClassName, flush, sub}: DocCardProps) {
    const [open, setOpen] = useState(defaultOpen);
    const shown = !collapsible || open || !!forceOpen;

    const heading = (
        <div className="d-flex align-items-center gap-2 min-w-0">
            {Icon && <span className="sales-doc-card-icon"><Icon size={16} /></span>}
            <div className="min-w-0">
                <div className="sales-doc-card-title">{title}</div>
                {!shown && summary ? <div className="sales-doc-card-summary text-truncate">{summary}</div>
                    : collapsible && hint && <div className="sales-doc-card-hint">{hint}</div>}
            </div>
        </div>
    );

    return (
        <div className={classNames("card card-border sales-doc-card", {"is-sub": sub}, className)}>
            <div className="sales-doc-card-header">
                {collapsible ? (
                    <button type="button" className="sales-doc-card-toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
                        {heading}
                        <ChevronDown size={18} className={classNames("sales-doc-card-chevron", {open: shown})} />
                    </button>
                ) : heading}
                {/* a fixed card's hint sits on the right of the header, before any buttons */}
                {((!collapsible && hint) || actions) && (
                    <div className="sales-doc-card-aside">
                        {!collapsible && hint && <div className="sales-doc-card-hint">{hint}</div>}
                        {actions && <div className="d-flex gap-2 flex-shrink-0">{actions}</div>}
                    </div>
                )}
            </div>
            {shown && <div className={classNames("sales-doc-card-body", {"is-flush": flush}, bodyClassName)}>{children}</div>}
        </div>
    );
}

/**
 * The two header sections of a document (party | details) side by side, equal height.
 * `left` is the first card's share of a 12-column row, e.g. 5 for 5 | 7 (default 6 | 6).
 */
export function DocPair({children, left = 6}: {children: ReactNode, left?: number}) {
    const style = {"--doc-pair-cols": `minmax(0, ${left}fr) minmax(0, ${12 - left}fr)`} as CSSProperties;
    return <div className="doc-pair" style={style}>{children}</div>;
}

/** Document total for the pinned save bar, with e.g. "2 lines · Tax 12.00" beside it. */
export function DocTotal({amount, currencyCode, label, details}: {amount: number, currencyCode?: string, label: string, details?: string[]}) {
    return (
        <>
            <span className="small">{label}</span>
            <span className="fs-5 fw-bold text-dark">{currencyCode ? `${currencyCode} ` : ""}{formatDecimal(amount)}</span>
            {details && details.length > 0 && <span className="small text-muted">· {details.join(" · ")}</span>}
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
                    <div className="fw-semibold text-dark">{isIsoDate(fact.value) ? formatDate(fact.value) : fact.value}</div>
                </div>
            ))}
        </div>
    );
}
