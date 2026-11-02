import {SelectOptionProps} from "./common";
import {Avatar} from "./user";

export type Department = {
    id: number,
    name: string,
    type: string,
    status: string,
};

export type StaffInfo = {
    id: number,
    name: string,
    contact_no: string,
    company_email: string,
    employment_type: string,
    avatar: Avatar|null,
}

export type DepartmentTypeOption = {
    name: string,
    value: string,
}

export function formatDepartmentTypeOption(type: DepartmentTypeOption): SelectOptionProps {
    return { value: type.value, label:type.name  };
}

export type DepartmentParentOption = {
    id: number;
    name: string;
    children: DepartmentParentOption[];
};
  
export function formatDepartmentParentOptions(departments: DepartmentParentOption[]): SelectOptionProps[] {
    let formattedDept: SelectOptionProps[] = [];  // Initialize the array to collect formatted departments

    // Recursive helper function to format department and its children
    const formatDepartmentWithChildren = (department: DepartmentParentOption): SelectOptionProps[] => {
        // Start by formatting the current department
        let formattedDepartment: SelectOptionProps[] = [formatDepartment(department)];

        // If the department has children, recursively format them
        if (department.children && department.children.length > 0) {
            department.children.forEach(child => {
                // Add child department to the formatted list
                formattedDepartment = formattedDepartment.concat(formatDepartmentWithChildren(child));  // Recursively handle child
            });
        }

        return formattedDepartment;
    };

    // For each root-level department, recursively format it along with its children
    departments.forEach(department => {
        formattedDept = formattedDept.concat(formatDepartmentWithChildren(department));
    });

    return formattedDept;  // Return the flattened array of all departments
}

// Format a single department as SelectOptionProps
const formatDepartment = (department: DepartmentParentOption): SelectOptionProps => {
    return {
        value: department.id.toString(),
        label: department.name
    };
};

export interface TreeNodeProps {
    label: string;
    value: number;
    expanded?: boolean;
    checked?: boolean;
    children: TreeNodeProps[];
}

export const transformDepartmentTreeData = (
    data: DepartmentParentOption[],
    selectedId?: number,
    excludeId?: number
): TreeNodeProps[] => {
    return data.filter((node) => node.id !== excludeId)
        .map((node) => ({
            label: node.name,
            value: node.id,
            expanded: true,
            checked: node.id === selectedId,
            children: transformDepartmentTreeData(
                node.children || [],
                selectedId,
                excludeId
            ),
        }));
};

/* // Type for each option within the `options` array (including nested ones)
export type SelectOption = {
    value: string; // The ID, represented as a string
    label: string; // The name of the department/option
    options?: SelectOption[]; // Optional nested `options` for subgroups
};

// Type for the main structure, which includes `label` and `options` at the top level
export type SelectGroup = {
    value: string,
    label: string; // The label for the group (e.g., "FournTec")
    options: SelectOption[]; // The options within this group (could be flat or nested)
};

// Type for the entire structure (an array of `SelectGroup`)
export type SelectData = SelectGroup[];

export function transformDepartmentParentData(data: DepartmentParentOption[]): SelectData {
    return data.map(department => {
        // Transform the main department object
        const transformed = {
            value: department.id.toString(),
            label: department.name,
            options: department.children.map(child => {
                const childTransformed = {
                    value: child.id.toString(),
                    label: child.name,
                };

                // Recursively process if there are further nested children
                if (child.children && child.children.length > 0) {
                    childTransformed.options = child.children.map(grandchild => ({
                        value: grandchild.id.toString(),
                        label: grandchild.name,
                    }));
                }

                return childTransformed;
            }),
        };

        return transformed;
    });
} */