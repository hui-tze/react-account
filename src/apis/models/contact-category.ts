// mirrors App\Domain\Constants\ContactEntityType
export const CONTACT_ENTITY_TYPES = ["company", "customer", "supplier", "employee", "bank", "other"] as const;

export type ContactEntityType = typeof CONTACT_ENTITY_TYPES[number];

export type ContactCategory = {
    id: number,
    company_id: number,
    entity_type: ContactEntityType,
    code: string,
    name: string,
    // created by the system (e.g. the company's "general" category) — its code/entity type are looked up by code
    is_system: boolean,
    status: string,
}
