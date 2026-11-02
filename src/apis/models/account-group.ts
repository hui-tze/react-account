export type AccountGroup = {
    id: number,
    company_id: number,
    account_class_id: number,
    parent_id: number | null,
    code: string,
    name: string,
    sequence: number,
    status: string,
}
