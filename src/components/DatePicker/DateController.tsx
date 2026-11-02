import {Controller} from "react-hook-form";
import {Form} from "react-bootstrap";
import DateRangePicker from "react-bootstrap-daterangepicker";
import {useSmartTranslation} from "@/hooks/use-translation";
import {DateTimeFormatting} from "@/constants/DateTimeFormat";
import {formatSingleDatePicker, formatSingleDateTimePicker, formatWeekDisplay} from "@/utils/DateTimeFormatter";
import {useRef} from "react";

export type DateControllerMode =
    | "date"
    | "time"
    | "datetime"
    | "week";

type DateControllerProps = {
    name: string;
    control: any;
    mode?: DateControllerMode;
    rules?: any;
    required?: boolean | string;
    error?: string;
    placeholder?: string;
    disabled?: boolean;
    format?: string;
    hint?: string;
    minDate?: string | Date;
    maxDate?: string | Date;
    onChangeExtra?: (value: string | null) => void;
    onWeekChangeExtra?: (range: { start: string; end: string }) => void;
};

export function DateController({
    name,
    control,
    mode = "date",
    rules,
    required,
    error,
    placeholder,
    disabled = false,
    format,
    hint,
    minDate,
    maxDate,
    onChangeExtra,
    onWeekChangeExtra,
}: DateControllerProps) {
    const pickerRef = useRef<any>(null);
    const {t} = useSmartTranslation();

    const resolvedFormat = (() => {
        if (format) return format;

        switch (mode) {
            case "date":
                return DateTimeFormatting.DateRangePickerDisplayDate;

            case "time":
                return DateTimeFormatting.DateRangePickerDisplayTime;

            case "datetime":
                return DateTimeFormatting.DateRangePickerDisplayDateTime;

            case "week":
                return "YYYY-[W]WW";

            default:
                return DateTimeFormatting.DateRangePickerDisplayDate;
        }
    })();

    const resolvedDisplayFormat = (() => {
        if (format) return format;

        switch (mode) {
            case "date":
                return DateTimeFormatting.DateRangePickerDate;

            case "time":
                return DateTimeFormatting.DateRangePickerDisplayTime;

            case "datetime":
                return DateTimeFormatting.DateRangePickerDateTime;

            case "week":
                return "YYYY-[W]WW";

            default:
                return DateTimeFormatting.DateRangePickerDate;
        }
    })();

    const resolvedPlaceholder = (() => {
        if (placeholder) return placeholder;

        switch (mode) {
            case "date":
                return t('select_date');

            case "time":
                return t('select_time');

            case "datetime":
                return t('select_date_time');

            case "week":
                return t('select_week');

            default:
                return t('select_date');
        }
    })();

    const isTimeOnly = mode === "time";

    return (
        <div>
            <Controller
                name={name}
                control={control}
                rules={{
                    ...(required
                        ? {
                              required:
                                  typeof required === "string"
                                      ? required
                                      : "*" + t("required")
                          }
                        : {}),
                    ...rules,
                }}
                render={({ field }) => {
                    return (
                        <DateRangePicker
                            ref={pickerRef}
                            initialSettings={{
                                autoApply: true,
                                autoUpdateInput: false,
                                singleDatePicker: true,
                                timePicker: mode === "time" || mode === "datetime",
                                timePicker24Hour: true,
                                timePickerIncrement: 1,
                                minDate: minDate,
                                maxDate: maxDate,
                                locale: {
                                    format: resolvedDisplayFormat,
                                },
                            }}
                            onShow={(event, picker) => {
                                if (isTimeOnly && picker?.container) {
                                    picker.container.find(".calendar-table").hide();
                                }
                            }}
                            onApply={(event, picker) => {
                                if (mode === "week") {
                                    const start = picker.startDate.clone().startOf("isoWeek");
                                    const end = picker.startDate.clone().endOf("isoWeek");

                                    const value = picker.startDate.format(resolvedFormat);

                                    field.onChange(value);

                                    onWeekChangeExtra?.({
                                        start: start.format("YYYY-MM-DD"),
                                        end: end.format("YYYY-MM-DD"),
                                    });
                                } else {
                                    const value = picker.startDate.format(resolvedFormat);

                                    field.onChange(value);
                                    onChangeExtra?.(value);
                                }
                            }}
                        >
                            <Form.Control
                                type="text"
                                value= {field.value
                                        ? mode === 'date'
                                            ? formatSingleDatePicker(new Date(field.value))
                                            : mode === 'time'
                                                ? field.value
                                                : mode === 'datetime'
                                                    ? formatSingleDateTimePicker(new Date(field.value))
                                                    : formatWeekDisplay(field.value)
                                        : ""
                                }
                                placeholder={resolvedPlaceholder}
                                disabled={disabled}
                                isInvalid={!!error}
                                onChange={() => {}}
                            />
                        </DateRangePicker>
                    )
                }}
            />

            {hint && (
                <div className="form-text text-muted fs-7">
                    {hint}
                </div>
            )}

            {error && (
                <span className="invalid-field">
                    {error}
                </span>
            )}
        </div>
    );
}