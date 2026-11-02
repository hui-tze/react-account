import type {SalesTaxType} from "@/apis/models/sales-lookup";

/**
 * Live preview of a sales document's totals while the user types.
 *
 * Mirror of the backend SalesTaxCalculator (app/Domain/Services/Sales/SalesTaxCalculator.php),
 * which recalculates and stores every amount on save — keep the two in step.
 *  - Line amount = round(qty × price) − round(that × discount %). Discount comes before tax.
 *  - Taxes apply in `sequence` order; a compound tax is charged on taxable + earlier taxes.
 *  - Inclusive prices: taxable is backed out and the last tax absorbs the rounding cent.
 *  - Shipping is charged as an item line, so it is taxed like any other line.
 *  - Money rounds to 2 decimals per line per tax type.
 */

export type TaxableLine = {
    quantity: number,
    unit_price: number,
    discount_percent: number,
    exempt?: boolean,
    exempt_tax_type_ids?: number[],
};

export type TaxAmount = {
    tax_type_id: number,
    code: string,
    name: string,
    rate: number,
    taxable_amount: number,
    tax_amount: number,
};

export type LineTotals = {
    gross: number,
    discount_amount: number,
    // in the document's price basis (includes tax when prices are tax-inclusive)
    line_total: number,
    taxable_amount: number,
    tax_amount: number,
    taxes: TaxAmount[],
};

export type SalesTotals = {
    lines: LineTotals[],
    taxes: TaxAmount[],
    subtotal: number,
    discount_total: number,
    tax_total: number,
    grand_total: number,
};

/** Round half away from zero to 2 decimals, nudged past binary float noise (1.005 -> 1.01). */
export function roundMoney(value: number): number {
    const nudged = value + (value >= 0 ? 1e-9 : -1e-9);
    return Math.sign(nudged) * Math.round(Math.abs(nudged) * 100) / 100 || 0;
}

export function calculateSalesTotals(taxTypes: SalesTaxType[], taxIncluded: boolean, lines: TaxableLine[]): SalesTotals {
    const ordered = [...taxTypes].sort((a, b) => (a.sequence - b.sequence) || (a.id - b.id));

    const outLines: LineTotals[] = lines.map(line => {
        const gross = roundMoney(Number(line.quantity || 0) * Number(line.unit_price || 0));
        const discount = roundMoney(gross * Number(line.discount_percent || 0) / 100);
        const amount = roundMoney(gross - discount);
        const exemptIds = (line.exempt_tax_type_ids ?? []).map(Number);
        const applicable = line.exempt ? [] : ordered.filter(t => !exemptIds.includes(Number(t.id)));

        return {gross, discount_amount: discount, line_total: amount, ...taxAmount(applicable, amount, taxIncluded)};
    });

    // per tax type summary across lines, in calculation order
    const summary = new Map<number, TaxAmount>();
    outLines.map(l => l.taxes).forEach(taxes => taxes.forEach(tax => {
        const row = summary.get(tax.tax_type_id) ?? {...tax, taxable_amount: 0, tax_amount: 0};
        row.taxable_amount = roundMoney(row.taxable_amount + tax.taxable_amount);
        row.tax_amount = roundMoney(row.tax_amount + tax.tax_amount);
        summary.set(tax.tax_type_id, row);
    }));
    const taxes = ordered.filter(t => summary.has(t.id)).map(t => summary.get(t.id)!);

    const subtotal = roundMoney(outLines.reduce((sum, l) => sum + l.line_total, 0));
    const taxTotal = roundMoney(taxes.reduce((sum, t) => sum + t.tax_amount, 0));

    return {
        lines: outLines,
        taxes,
        subtotal,
        discount_total: roundMoney(outLines.reduce((sum, l) => sum + l.discount_amount, 0)),
        tax_total: taxTotal,
        grand_total: roundMoney(subtotal + (taxIncluded ? 0 : taxTotal)),
    };
}

function taxAmount(taxTypes: SalesTaxType[], amount: number, taxIncluded: boolean): {taxable_amount: number, tax_amount: number, taxes: TaxAmount[]} {
    if (taxTypes.length === 0 || amount === 0) {
        return {taxable_amount: amount, tax_amount: 0, taxes: taxTypes.map(t => taxRow(t, amount, 0))};
    }

    const taxable = taxIncluded ? roundMoney(amount / multiplier(taxTypes)) : amount;

    let running = 0;
    const taxes = taxTypes.map(type => {
        const base = type.is_compound ? taxable + running : taxable;
        const tax = roundMoney(base * Number(type.rate) / 100);
        running += tax;
        return taxRow(type, roundMoney(base), tax);
    });

    if (taxIncluded) {
        // the last tax absorbs rounding so taxable + tax equals the price the user entered
        const drift = roundMoney(amount - taxable - taxes.reduce((sum, t) => sum + t.tax_amount, 0));
        if (drift !== 0) {
            const last = taxes[taxes.length - 1];
            last.tax_amount = roundMoney(last.tax_amount + drift);
        }
    }

    return {taxable_amount: taxable, tax_amount: roundMoney(taxes.reduce((sum, t) => sum + t.tax_amount, 0)), taxes};
}

/** Taxed total of 1.00 of taxable amount, honouring compound taxes. */
function multiplier(taxTypes: SalesTaxType[]): number {
    let running = 0;
    taxTypes.forEach(type => {
        const base = type.is_compound ? 1 + running : 1;
        running += base * Number(type.rate) / 100;
    });
    return 1 + running;
}

function taxRow(type: SalesTaxType, taxable: number, tax: number): TaxAmount {
    return {tax_type_id: Number(type.id), code: type.code, name: type.name, rate: Number(type.rate), taxable_amount: taxable, tax_amount: tax};
}
