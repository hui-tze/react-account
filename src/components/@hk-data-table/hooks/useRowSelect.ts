import React from "react";

type UseRowSelectProps<T> = {
    slice: T[];
    data: T[] | undefined;
    idAcessor?: string;
};

export function useRowSelect<T extends { [key: string]: any }>(props: UseRowSelectProps<T>) {
    const { slice, data, idAcessor } = props;
    const [selectedRows, setSelectedRows] = React.useState<Set<string | number>>(new Set());
    const [selectAll, setSelectAll] = React.useState(false);

    // Function to handle row selection
    const handleRowSelection = (id: string | number) => {
        const updatedSelection = new Set(selectedRows);

        if (updatedSelection.has(id)) {
            updatedSelection.delete(id);
        } else {
            updatedSelection.add(id);
        };

        setSelectedRows(updatedSelection);

        // Determine if we should select all rows
        if (updatedSelection.size === slice.length) {
            setSelectAll(true);
        } else {
            setSelectAll(false);
        }
    };

    // Function to handle select all checkbox
    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedRows(new Set()); // Unselect all rows
        } else {
            if( idAcessor) {
                const allIds = slice.map(row => row[idAcessor as keyof T]);
                setSelectedRows(new Set(allIds));
            } else {
                const allIds = slice.map((row, indx) => indx);
                setSelectedRows(new Set(allIds));
            }
        }

        setSelectAll(!selectAll);
    };

    // Helper function to check if a row is selected
    const isRowSelected = (id: string | number): boolean => selectedRows.has(id);

    return { selectAll, handleRowSelection, handleSelectAll, isRowSelected }
}

export default useRowSelect
