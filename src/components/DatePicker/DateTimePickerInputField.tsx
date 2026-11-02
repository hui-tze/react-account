import {DateTimeFormatting} from "@/constants/DateTimeFormat";
import {useSmartTranslation} from "@/hooks/use-translation";
import {formatSingleDateTimePicker} from "@/utils/DateTimeFormatter";
import {Form} from "react-bootstrap";
import DateRangePicker from "react-bootstrap-daterangepicker";
import {Controller} from "react-hook-form";

type DateTimePickerFieldProps = {
    name: string;
    control: any;
    label?: string;
    required?: boolean;
    disabled?: boolean;
    error?: string;
    rules?: any;
};

export function DateTimePickerInputField({
    name,
    control,
    label,
    required,
    disabled,
    error,
    rules
}: DateTimePickerFieldProps) {
    const {t} = useSmartTranslation();
    
    return (
        <>
            {label && (
                <Form.Label className={required ? 'require-label' : ''}>
                    {label}
                </Form.Label>
            )}

            <Controller
                name={name}
                control={control}
                rules={{
                    ...(required ? {required: '*' + t('required')} : {}),
                    ...rules
                }}
                render={({ field }) => (
                    <DateRangePicker
                        initialSettings={{
                            timePicker: true,
                            singleDatePicker: true,
                            showDropdowns: true,
                            autoUpdateInput: false,
                            locale: {
                                format: DateTimeFormatting.DateRangePickerDateTime,
                            },
                            drops: "auto"
                        }}
                        onEvent={(e: any, picker: any) => {
                            const selectedDate = picker.startDate.format(
                                DateTimeFormatting.DateRangePickerDisplayDateTime
                            );
                            field.onChange(selectedDate);
                        }}
                    >
                        <Form.Control
                            type="text"
                            readOnly
                            disabled={disabled}
                            isInvalid={!!error}
                            style={{
                                backgroundColor: disabled ? undefined : '#fff',
                                opacity: disabled ? undefined : 1,
                                cursor: disabled ? 'not-allowed' : 'pointer'
                            }}
                            value={
                                field.value &&
                                !isNaN(new Date(field.value).getTime())
                                    ? formatSingleDateTimePicker(new Date(field.value))
                                    : ''
                            }
                        />
                    </DateRangePicker>
                )}
            />

            {error && <span className="invalid-field">{error}</span>}
        </>
    );
}