export type DocumentNumbering = {
    id: number,
    company_id: number,
    document_type: string,
    pattern: string,
    next_number: number,
    padding: number,
    allow_manual: boolean,
    auto_generate: boolean,
    reset_period: string,
    status: string,
}

export type DocumentTypeOption = {
    value: string,
    label: string,
}
