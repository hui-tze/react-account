import {useEffect, useMemo} from "react";
import {Alert, Col, Row} from "react-bootstrap";
import {useRequestForm} from "@/hooks/use-request-handler";
import {DisplaySettings} from "@/apis/models/system-setting";
import {saveSystemSettings} from "@/apis/requests/system-setting-api";
import {SelectField, SelectOption} from "@/components/FormField/FormFields";
import SettingsFormPage, {FormSectionTitle} from "@/views/Settings/shared/SettingsFormPage";
import {useSmartTranslation} from "@/hooks/use-translation";
import {formatNumber, formatPhpDate, separatorOf, withSeparator} from "./format-preview";

const DECIMAL_PLACES: SelectOption[] = [0, 1, 2, 3, 4, 5, 6].map(n => ({value: n, label: String(n)}));
const PAGE_SIZES = [10, 15, 20, 25, 50, 100];
const DATE_FORMATS = ["d/m/Y", "m/d/Y", "Y-m-d", "d-m-Y", "d.m.Y", "d M Y"];
const SAMPLE_NUMBER = 1234567.891234;

type DisplayPreferenceFormProps = {
    settings: DisplaySettings,
    onSaved: () => Promise<DisplaySettings | undefined>,
};

export function DisplayPreferenceForm({settings, onSaved}: DisplayPreferenceFormProps) {
    const {t} = useSmartTranslation();

    const {control, watch, setValue, reset, submitting, handleSubmitRequest} = useRequestForm<DisplaySettings>({
        formOptions: {defaultValues: settings},
    });

    // keep date_format and date_separator consistent: picking one updates the other
    useEffect(() => {
        const subscription = watch((values, {name}) => {
            if (name === "date_format" && values.date_format) {
                const sep = separatorOf(values.date_format);
                if (sep && sep !== values.date_separator) {
                    setValue("date_separator", sep);
                }
            }
            if (name === "date_separator" && values.date_format && values.date_separator) {
                const next = withSeparator(values.date_format, values.date_separator);
                if (next !== values.date_format) {
                    setValue("date_format", next);
                }
            }
        });
        return () => subscription.unsubscribe();
    }, [watch, setValue]);

    const values = watch();

    const separatorOptions = useMemo(() => ({
        thousand: [
            {value: ",", label: `${t('comma')} ( , )`},
            {value: ".", label: `${t('dot')} ( . )`},
            {value: " ", label: t('space')},
            {value: "'", label: `${t('apostrophe')} ( ' )`},
        ],
        decimal: [
            {value: ".", label: `${t('dot')} ( . )`},
            {value: ",", label: `${t('comma')} ( , )`},
        ],
        date: [
            {value: "/", label: `${t('slash')} ( / )`},
            {value: "-", label: `${t('dash')} ( - )`},
            {value: ".", label: `${t('dot')} ( . )`},
            {value: " ", label: t('space')},
        ],
    }), [t]);

    const today = useMemo(() => new Date(), []);
    const dateFormatOptions: SelectOption[] = useMemo(() => {
        const formats = values.date_format && !DATE_FORMATS.includes(values.date_format)
            ? [...DATE_FORMATS, values.date_format]
            : DATE_FORMATS;
        return formats.map(f => ({value: f, label: `${f}  —  ${formatPhpDate(today, f)}`}));
    }, [values.date_format, today]);

    const pageSizeOptions: SelectOption[] = useMemo(() => {
        const sizes = values.records_per_page && !PAGE_SIZES.includes(values.records_per_page)
            ? [...PAGE_SIZES, values.records_per_page].sort((a, b) => a - b)
            : PAGE_SIZES;
        return sizes.map(n => ({value: n, label: String(n)}));
    }, [values.records_per_page]);

    const fmt = (decimals: number) => formatNumber(SAMPLE_NUMBER, decimals, values.thousand_separator ?? ",", values.decimal_separator ?? ".");

    return (
        <SettingsFormPage
            onSubmit={handleSubmitRequest({
                request: (formData) => saveSystemSettings("display", formData),
                onSuccess: async () => {
                    const fresh = await onSaved();
                    if (fresh) {
                        reset(fresh);
                    }
                },
            })}
            submitting={submitting}
            isEditing
        >
            <FormSectionTitle title={t('decimalPlaces')} />
            <Row className="gx-3">
                <Col md={6}>
                    <SelectField control={control} name="price_decimal_places" label={t('priceDecimalPlaces')} numeric required options={DECIMAL_PLACES} />
                </Col>
                <Col md={6}>
                    <SelectField control={control} name="quantity_decimal_places" label={t('quantityDecimalPlaces')} numeric required options={DECIMAL_PLACES} />
                </Col>
                <Col md={6}>
                    <SelectField control={control} name="exchange_rate_decimal_places" label={t('exchangeRateDecimalPlaces')} numeric required options={DECIMAL_PLACES} />
                </Col>
                <Col md={6}>
                    <SelectField control={control} name="percentage_decimal_places" label={t('percentageDecimalPlaces')} numeric required options={DECIMAL_PLACES} />
                </Col>
            </Row>

            <hr className="my-3" />
            <FormSectionTitle title={t('numberAndDateFormat')} />
            <Row className="gx-3">
                <Col md={6}>
                    <SelectField control={control} name="thousand_separator" label={t('thousandSeparator')} required options={separatorOptions.thousand} />
                </Col>
                <Col md={6}>
                    <SelectField
                        control={control}
                        name="decimal_separator"
                        label={t('decimalSeparator')}
                        required
                        options={separatorOptions.decimal}
                        rules={{validate: (value, form) => value !== form.thousand_separator || t('separatorsMustDiffer')}}
                    />
                </Col>
                <Col md={6}>
                    <SelectField control={control} name="date_format" label={t('dateFormat')} required options={dateFormatOptions} />
                </Col>
                <Col md={6}>
                    <SelectField control={control} name="date_separator" label={t('dateSeparator')} required options={separatorOptions.date} />
                </Col>
            </Row>

            <hr className="my-3" />
            <FormSectionTitle title={t('listing')} />
            <Row className="gx-3">
                <Col md={6}>
                    <SelectField control={control} name="records_per_page" label={t('recordsPerPage')} numeric required options={pageSizeOptions} />
                </Col>
            </Row>

            <Alert variant="light" className="border mt-2 mb-3">
                <div className="text-uppercase text-info small fw-semibold mb-2">{t('preview')}</div>
                <Row className="gx-3 gy-1 small">
                    <Col sm={6} lg={3}><span className="text-muted">{t('price')}:</span> <span className="fw-semibold">{fmt(values.price_decimal_places)}</span></Col>
                    <Col sm={6} lg={3}><span className="text-muted">{t('quantity')}:</span> <span className="fw-semibold">{fmt(values.quantity_decimal_places)}</span></Col>
                    <Col sm={6} lg={3}><span className="text-muted">{t('exchangeRate')}:</span> <span className="fw-semibold">{formatNumber(4.123456789, values.exchange_rate_decimal_places, values.thousand_separator ?? ",", values.decimal_separator ?? ".")}</span></Col>
                    <Col sm={6} lg={3}><span className="text-muted">{t('percentage')}:</span> <span className="fw-semibold">{formatNumber(12.345678, values.percentage_decimal_places, values.thousand_separator ?? ",", values.decimal_separator ?? ".")}%</span></Col>
                    <Col sm={6} lg={3}><span className="text-muted">{t('date')}:</span> <span className="fw-semibold">{formatPhpDate(today, values.date_format ?? "d/m/Y")}</span></Col>
                </Row>
            </Alert>
        </SettingsFormPage>
    );
}
