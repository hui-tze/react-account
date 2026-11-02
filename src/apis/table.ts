import {SelectOptionProps} from "./models/common";

export type DateRangeValue = {
    start: string;
    end: string;
};

type FilterType = 'text' | 'radio' | 'select-multiple' | 'select' | 'date' | 'date-range';

type FilterValue =
  | string
  | number
  | string[]
  | number[]
  | DateRangeValue
  | undefined;

export type TableFilters = Record<string, {
    value: FilterValue;
    type: FilterType;
    options?: SelectOptionProps[]|null,
    filter: {
        accessor: string;
        by: 'eq' | 'in' | 'like' | 'is' | 'date_eq' | 'date_between';
        title: string;
    };
}>;

export function isDateRange(value: any): value is DateRangeValue {
    return (
        value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        "start" in value &&
        "end" in value
    );
}