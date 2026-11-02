import {SelectOptionProps} from "./common";

export type Designation = {
    id: number;
    branch_id: number;
    name: string;
    status: string;
}

export function formatDesignationOption(designation: Designation): SelectOptionProps {
    return { value: designation.id.toString(), label:designation.name };
}
