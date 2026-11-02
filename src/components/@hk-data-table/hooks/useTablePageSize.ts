import {useEffect, useState} from "react";

function calculateRange<T>(data: T[] | undefined, rowsPerPage: number) {
    const range = [];
    const num = data ? Math.ceil(data.length / rowsPerPage) : 0;
    for (let i = 1; i <= num; i++) {
        range.push(i);
    }
    return range;
};

function sliceData<T>(data: T[] | undefined, page: number, rowsPerPage: number) {
    return data ? data.slice((page - 1) * rowsPerPage, page * rowsPerPage) : [];
};

export default function useTablePageSize<T>(data: T[] | undefined, page: number, rowsPerPage: number) {
    const [tableRange, setTableRange] = useState<number[] | undefined>([]);
    const [slice, setSlice] = useState<T[] | undefined>(undefined);

    useEffect(() => {
        if (rowsPerPage) {
            const range = calculateRange(data, rowsPerPage);
            setTableRange([...range]);

            const slice = sliceData(data, page, rowsPerPage);
            setSlice([...slice]);
        }
        else {
            setSlice(data);
        }

    }, [data, setTableRange, page, rowsPerPage, setSlice]);

    return { slice, range: tableRange };
};
