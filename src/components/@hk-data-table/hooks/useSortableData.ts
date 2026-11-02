import React from "react";

type SortDirection = 'ascending' | 'descending';

type SortConfigType = {
    key: string,
    direction: SortDirection,
}

export default function useSortableData<TData extends Record<string, any>>(items: TData[], initialConfig?: SortConfigType | undefined) {
    // rows come in the server's order (it sorts and paginates); keep it until a header is clicked
    const [sortConfig, setSortConfig] = React.useState<SortConfigType>(() => initialConfig || { key: '', direction: 'ascending' });

    const sortedItems = React.useMemo(() => {
        const sortableItems = [...items]; // Create a shallow copy to avoid mutating original items

        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                } else if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0; // If values are equal, return 0
            });
        }

        return sortableItems;
    }, [items, sortConfig]);

    // Toggle the sort direction when the same column is clicked
    const requestSort = (sort:boolean, key: string) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        // Toggle direction if the same column is clicked again
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }

        if (sort) {
            setSortConfig({ key, direction });
        }
    };

    return { items: sortedItems, requestSort, sortConfig };
};
