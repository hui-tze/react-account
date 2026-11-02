import React from "react";

// Define the hook to accept generic type `T` where each item in `data` has an `id` field and potentially a `starred` field
export function useStarred<T extends { id: string | number; starred?: boolean }>(data: T[] = []) {
    // Initialize state as an empty array or the provided data
    const [favData, setFavData] = React.useState<T[]>(data);

    // Function to toggle the `starred` property of a specific row based on the `id`
    const handleStared = (id: string | number) => {
        setFavData((prevData) =>
            prevData.map((row) =>
                row.id === id ? { ...row, starred: !row.starred } : row
            )
        );
    };

    return { handleStared, favData };
}

export default useStarred;
