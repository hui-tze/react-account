import {Col} from "react-bootstrap";
import {Control, FieldValues, Path} from "react-hook-form";
import {TextField} from "@/components/FormField/FormFields";
import {useSmartTranslation} from "@/hooks/use-translation";
import type {DocumentPricing} from "./useDocumentPricing";

type ExchangeRateFieldProps<T extends FieldValues> = {
    control: Control<T>,
    // customer or supplier document pricing
    pricing: Pick<DocumentPricing, "currency" | "lookedUpRate" | "foreignCurrency">,
    // a saved document's rate — keeps the field visible when it isn't 1
    savedRate?: string | number,
    readOnly?: boolean,
};

/**
 * Exchange rate for a foreign-currency customer (hidden for the home currency).
 * Blank uses the rate on the document date; required when that date has no rate.
 */
export function ExchangeRateField<T extends FieldValues>({control, pricing, savedRate, readOnly}: ExchangeRateFieldProps<T>) {
    const {t} = useSmartTranslation();
    const visible = pricing.foreignCurrency || (savedRate !== undefined && Number(savedRate) !== 1);
    if (!visible) {
        return null;
    }

    const missing = pricing.lookedUpRate === null;
    return (
        <Col sm={6}>
            <TextField
                control={control}
                name={"exchange_rate" as Path<T>}
                label={t('exchangeRateTo', {code: pricing.currency?.code ?? ""})}
                type="number"
                numeric
                step="0.000001"
                disabled={readOnly}
                required={missing}
                placeholder={pricing.lookedUpRate ? String(pricing.lookedUpRate) : undefined}
                hint={missing ? t('noRateForDate') : t('exchangeRateBlankHint')}
            />
        </Col>
    );
}
