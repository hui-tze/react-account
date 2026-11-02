export type CompanyAssetType = {
    id: number,
    branch_id: number,
    name: string,
    remark: string|null,
}

export type CompanyAsset = {
    id: number,
    branch_id: number,
    name: string,
    type_id: number,
    type: string,
    remark: string|null,
    status: string
}