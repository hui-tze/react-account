import React, {ReactElement} from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import '@/styles/css/custom-datepicker.css';
import moment from "moment";
import {Form} from "react-bootstrap";
import {DateTimeFormatting} from "@/constants/DateTimeFormat";

type MonthYearPickerProps = {
    date: string | Date;
    onChange: (date: Date | null) => void;
    displayFormat?: string;
    customInput?: ReactElement;
    calendarType?: "day" | "month";
};

export const MonthYearPicker: React.FC<MonthYearPickerProps> = ({
    date,
    onChange,
    displayFormat,
    calendarType = "month",
    customInput
}) => {
    const resolvedFormat = displayFormat ?? 
        (calendarType === "month" ? "MMMM YYYY" : "DD/MM/yyyy");

    const selectedDate = (() => {
        if (date instanceof Date) return date;

        if (typeof date === "string") {
            const parsed = moment(date, [
                DateTimeFormatting.DateRangePickerDisplayDate,
                "YYYY-MM-DD",
                resolvedFormat,
            ]);
            return parsed.isValid() ? parsed.toDate() : new Date();
        }

        return new Date();
    })();

    const defaultInput = (
        <Form.Control
            type="text"
            value={moment(date).format(resolvedFormat)}
            readOnly
        />
    );

    return (
        <DatePicker
            selected={selectedDate}
            onChange={onChange}
            dateFormat={resolvedFormat}
            showMonthYearPicker={calendarType === 'month'}
            showFullMonthYearPicker={calendarType === 'month'}
            showMonthDropdown={calendarType === 'month'}
            showYearDropdown={calendarType === 'month'}
            dropdownMode="select"
            customInput={customInput ?? defaultInput}
            popperPlacement="bottom-start"
            popperModifiers={[
                {
                    name: "offset",
                    options: { offset: [0, 10] },
                    fn: (state: any) => state
                },
                {
                    name: "preventOverflow",
                    options: { boundary: "viewport" },
                    fn: (state: any) => state
                }
            ]}
        />
    );
};
