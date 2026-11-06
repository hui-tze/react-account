import {ReactNode} from "react";
import classNames from "classnames";
import {AlertCircle, Check} from "react-feather";
import {Control, FieldErrors, FieldValues, useFormState} from "react-hook-form";
import {formatDecimal} from "@/views/Inventory/shared/options";
import {useSmartTranslation} from "@/hooks/use-translation";
import type {SalesTotals} from "./tax";

/** One thing the user should look at before saving. */
export type EntryCheck = {
    text: string,
    // warning: will likely stop or hold the save; info: worth a look
    tone?: "warning" | "info",
};

/**
 * The strip on top of a document entry: what still needs attention, or — when nothing does —
 * a one-line confirmation of what is set.
 */
// entries may be falsy (`cond && {...}`) and are skipped
export function EntryChecks({issues, ready}: {issues: (EntryCheck | null | false | undefined | 0 | "")[], ready?: (string | null | false | undefined | 0)[]}) {
    const {t} = useSmartTranslation();
    const shown = issues.filter((c): c is EntryCheck => !!c);
    const facts = (ready ?? []).filter((f): f is string => !!f);

    if (shown.length === 0) {
        return (
            <div className="doc-checks is-ready">
                <span className="doc-checks-title"><Check size={15} />{t('readyToSave')}</span>
                {facts.length > 0 && <span className="doc-checks-list">{facts.join(" · ")}</span>}
            </div>
        );
    }

    return (
        <div className={classNames("doc-checks", shown.some(c => c.tone !== "info") ? "is-warning" : "is-info")}>
            <span className="doc-checks-title"><AlertCircle size={15} />{t('thingsToCheck', {count: shown.length})}</span>
            <span className="doc-checks-list">
                {shown.map(check => <span key={check.text} className={check.tone === "info" ? "is-info" : undefined}>{check.text}</span>)}
            </span>
        </div>
    );
}

const countErrors = (errors: FieldErrors | undefined): number => !errors ? 0 : Object.values(errors).reduce<number>((n, error) => {
    if (!error || typeof error !== "object") {
        return n;
    }
    // a leaf error has a message / type; anything else is a nested group (lines.0.quantity …)
    return n + ("type" in error || "message" in error ? 1 : 0) + countErrors(error as FieldErrors);
}, 0);

/** After a save attempt, how many fields failed validation. */
export function useErrorCheck<T extends FieldValues>(control: Control<T>): EntryCheck | null {
    const {t} = useSmartTranslation();
    const {errors, isSubmitted} = useFormState({control});
    const count = countErrors(errors as FieldErrors);
    return isSubmitted && count > 0 ? {text: t('fieldsNeedAttention', {count}), tone: "warning"} : null;
}

type CheckLine = {item_id?: number | null, unit_price?: number | null, quantity?: number | null};

/** Item lines that are blank or priced at zero, and how many lines are filled in. */
export function lineChecks(lines: CheckLine[] | undefined, t: (key: string, options?: Record<string, unknown>) => string, {optional}: {optional?: boolean} = {}): {issues: EntryCheck[], filled: number} {
    const rows = lines ?? [];
    const filled = rows.filter(l => l.item_id).length;
    const issues: EntryCheck[] = [];
    if (filled === 0 && !optional) {
        issues.push({text: t('checkAddItem'), tone: "info"});
    }
    rows.forEach((line, index) => {
        if (!line.item_id) {
            // a single untouched line on a new document is covered by "add an item"
            if (filled > 0 || rows.length > 1) {
                issues.push({text: t('checkLineNoItem', {line: index + 1}), tone: "info"});
            }
        } else if (!Number(line.unit_price)) {
            issues.push({text: t('checkLineNoPrice', {line: index + 1}), tone: "info"});
        }
    });
    return {issues, filled};
}

/** "2 lines · Tax 279.99" beside the total in the save bar. */
export function totalDetails(totals: SalesTotals, lineCount: number, t: (key: string, options?: Record<string, unknown>) => string): string[] {
    return [
        t('lineCount', {count: lineCount}),
        totals.tax_total ? t('taxAmountShort', {amount: formatDecimal(totals.tax_total)}) : null,
    ].filter((d): d is string => !!d);
}

/** Under a line grid: buttons on the left (add line, copy from…), totals on the right. */
export function LinesFooter({actions, totals}: {actions?: ReactNode, totals?: ReactNode}) {
    if (!actions && !totals) {
        return null;
    }
    return (
        <div className="doc-lines-footer">
            <div className="doc-lines-actions">{actions}</div>
            {totals && <div className="doc-lines-totals">{totals}</div>}
        </div>
    );
}

/** Text above / between grids inside a flush card body (errors, short notes). */
export function LinesNote({children, tone}: {children: ReactNode, tone?: "danger" | "muted"}) {
    return <div className={classNames("doc-lines-note", tone === "danger" ? "text-danger" : "text-muted")}>{children}</div>;
}
