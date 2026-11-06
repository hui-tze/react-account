export type UserProfile = {
    id: number,
    user_id: number,
    // the company this browser tab works in
    company_id: number | null,
    // the user's saved default company
    default_company_id?: number | null,
    name: string | null,
    identity_no: string | null,
    gender: string | null,
    contact_no: string | null,
}
