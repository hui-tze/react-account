import {format} from "date-fns";
import qs from "qs";

export class QueryFilter {
    private _currentSortingCount: number = 0;
    private _filter: Map<string, string|number> = new Map();

    /**
     * Sets a filter for a field that matches a value using a = operator.
     *
     * @param {string} field - The name of the field to filter on.
     * @param {string|number} value - The value to match using the = operator.
     * @return {QueryFilter} - The QueryFilter object with the filter set.
     */
    where(field: string, value: string|number): QueryFilter {
        this._filter.set(`${field}[eq]`, value);
        return this;
    }

    /**
     * Sets a filter for a field that matches a value using a boolean value.
     *
     * @param {string} field - The name of the field to filter on.
     * @param {boolean|string} value - The value to match using the = operator
     * @return {QueryFilter} - The QueryFilter object with the filter set.
     */
    whereIs(field: string, value: string|boolean): QueryFilter {
        if (typeof value == 'boolean') {
            const stringValue = value ? "true" : "false";
            this._filter.set(`${field}[is]`, stringValue);
            return this;
        }

        this._filter.set(`${field}[is]`, value);
        return this;
    }

    /**
     * Sets a filter for a field that matches a value using a LIKE operator.
     *
     * @param {string} field - The name of the field to filter on.
     * @param {string|number} value - The value to match using the LIKE operator.
     * @return {QueryFilter} - The QueryFilter object with the filter set.
     */
    whereLike(field: string, value: string|number): QueryFilter {
        this._filter.set(`${field}[like]`, value);
        return this;
    }

    whereHasLike(field: string, relation: string, column: string, value: string|number): QueryFilter {
        this._filter.set(`${field}[has_like][column]`, column);
        this._filter.set(`${field}[has_like][relation]`, relation);
        this._filter.set(`${field}[has_like][value]`, value);
        return this;
    }

    /**
     * Sets a date range filter on the specified field.
     *
     * @param {string} field - The field to filter on.
     * @param {Date|string} startDate - The start date of the range. Can be a Date object or a string.
     * @param {Date|string} endDate - The end date of the range. Can be a Date object or a string.
     * @param {string} dateFormat - The format of the date string if a Date is provided. Defaults to "yyyy-MM-dd".
     * @return {QueryFilter}
     */
    whereDateRange(field: string, startDate: Date|string, endDate: Date|string, dateFormat = "yyyy-MM-dd"): QueryFilter {
        const from = startDate instanceof Date ? format(startDate, dateFormat) : startDate;
        const to = endDate instanceof Date ? format(endDate, dateFormat) : endDate;
        this._filter.set(`${field}[date_range]`, `${from}|${to}`);
        return this;
    }

    /**
     * Adds a filter to the query based on an "in" condition.
     *
     * @param {string} field - The field to filter on.
     * @param {string[]|number[]} values - An array of values to match against.
     * @return {QueryFilter}
     */
    whereIn(field: string, values: string[]|number[]): QueryFilter {
        for (const [index, value] of values.entries()) {
            this._filter.set(`${field}[in][${index}]`, value);
        }
        return this;
    }

    /**
     * Sets a filter condition where the value of a specified field is after a certain date.
     *
     * @param {string} field - The name of the field to filter.
     * @param {Date|string} date - The date to filter after. Can be a Date object or a string in the format "yyyy-MM-dd".
     * @param {string} dateFormat - The format of the date string if a Date is provided. Defaults to "yyyy-MM-dd".
     * @return {QueryFilter}
     */
    whereDateAfter(field: string, date: Date|string, dateFormat = "yyyy-MM-dd"): QueryFilter {
        const afterDate = date instanceof Date ? format(date, dateFormat) : date;
        this._filter.set(`${field}[date_after]`, afterDate);
        return this;
    }

    /**
     * Sets a filter condition where the specified date field should be before a given date.
     *
     * @param {string} field - The name of the date field.
     * @param {Date|string} date - The date to compare against. It can be a Date object or a string in the specified format.
     * @param {string} dateFormat - The format of the date string if a Date is provided. Defaults to "yyyy-MM-dd".
     * @return {QueryFilter}
     */
    whereDateBefore(field: string, date: Date|string, dateFormat = "yyyy-MM-dd"): QueryFilter {
        const beforeDate = date instanceof Date ? format(date, dateFormat) : date;
        this._filter.set(`${field}[date_before]`, beforeDate);
        return this;
    }

    /**
     * Sets a filter condition where the value of a specified field is after a certain date.
     *
     * @param {string} field - The name of the field to filter.
     * @param {Date|string} date - The date to filter after. Can be a Date object or a string in the format "yyyy-MM-dd".
     * @param {string} dateFormat - The format of the date string if a Date is provided. Defaults to "yyyy-MM-dd".
     * @return {QueryFilter}
     */
    whereDateEqual(field: string, date: Date|string, dateFormat = "yyyy-MM-dd"): QueryFilter {
        const formattedDate = date instanceof Date ? format(date, dateFormat) : date;
        this._filter.set(`${field}`, formattedDate);
        return this;
    }

    /**
     * Sets a filter condition where the specified field starts with the given value.
     *
     * @param {string} field - The field to filter on.
     * @param {string} value - The value to check if the field starts with.
     * @return {QueryFilter} - The QueryFilter instance for method chaining.
     */
    whereStartWith(field: string, value: string): QueryFilter {
        this._filter.set(`${field}[start_with]`, value);
        return this;
    }

    /**
     * Sets a filter condition where the specified field ends with the given value.
     *
     * @param {string} field - The field to filter on.
     * @param {string} value - The value that the field should end with.
     * @return {QueryFilter} - The updated query filter object.
     */
    whereEndWith(field: string, value: string): QueryFilter {
        this._filter.set(`${field}[end_with]`, value);
        return this;
    }

    /**
     * Sort by column asc
     *
     * @param {string} field - The field to be sorted
     * @return {QueryFilter} - The updated query filter object.
     */
    sortByAsc(field: string) {
        // sort[0]
        this._filter.set(`sort[${this._currentSortingCount}]`, `${field}|asc`);
        ++this._currentSortingCount;
        return this;
    }

    /**
     * Sort by column desc
     *
     * @param {string} field - The field to be sorted
     * @return {QueryFilter} - The updated query filter object.
     */
    sortByDesc(field: string) {
        this._filter.set(`sort[${this._currentSortingCount}]`, `${field}|desc`);
        ++this._currentSortingCount;
        return this;
    }

    /**
     * Returns the current Map object.
     *
     * @return {Map<string, string|number>} Current filter Map object
     */
    getFilter(): Map<string, string|number> {
        return this._filter;
    }

    stringify(): string {
        return qs.stringify(Object.fromEntries(this.getFilter()));
    }
}
