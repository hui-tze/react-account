import {DynamicFieldType} from "@/constants/DynamicFieldType";
import {SelectOptionProps} from "./common";

export type ClaimCategory = {
    id: number;
    branch_id: number;
    name: string;
    current_dyn_form_uid: string;
}

export type ClaimType = {
    id: number,
    branch_id: number,
    name: string,
    description: string|null,
    claim_category_id: number,
    current_dyn_form_uid: string,
    yearly_quota: number|null,
    monthly_quota: number|null,
    per_req_quota: number|null,
    category: ClaimCategory,
}

export type DynamicField = {
    type: DynamicFieldType,
    label: string,
    is_required: boolean,
    options: string[]
}

type ClaimOptionProps = SelectOptionProps & {
    category_id: number,
}
export function formatClaimTypeOption(claim: ClaimType): ClaimOptionProps {
    return { value: claim.id.toString(), label: claim.name, category_id: claim.claim_category_id };
}