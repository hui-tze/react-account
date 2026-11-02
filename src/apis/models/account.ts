export type Account = {
    id: number,
    company_id: number,
    account_group_id: number,
    account_code: string,
    account_name: string,
    account_type: string,
    allow_transaction: boolean,
    is_control_account: boolean,
    status: string,
}
