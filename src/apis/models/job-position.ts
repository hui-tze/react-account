import {SelectOptionProps} from "./common";

export type JobPosition = {
    id: number;
    branch_id: number;
    name: string;
    status: string;
}

export function formatJobPositionOption(position: JobPosition): SelectOptionProps {
    return { value: position.id.toString(), label:position.name };
}
