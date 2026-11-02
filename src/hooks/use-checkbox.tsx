import React from "react";

type useCheckBoxSelectProps<T> = {
    slice: T[];
};

export default function useCheckBoxSelect<T extends { id: string | number }>(props: useCheckBoxSelectProps<T>) {
    const { slice } = props;
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
            const allIds = slice.map(row => row.id); // assuming each row has a unique 'id'
            setSelectedRows(new Set(allIds)); // Select all rows
        }

        setSelectAll(!selectAll);
    };

    // Helper function to check if a row is selected
    const isRowSelected = (id: string | number): boolean => selectedRows.has(id);

    return { selectAll, handleRowSelection, handleSelectAll, isRowSelected };
}
