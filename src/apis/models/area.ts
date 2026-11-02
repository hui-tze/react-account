import {Option} from "./common";

export type AreaDetailOfficer = {
    is_primary: number;
    staff: {
        id: number,
        name: string,
    }
}

export type Area = {
    id: number,
    code: string,
    name: string,
    collection_frequency: string[],
    council: Option,
    driver: {
        id: number,
        name: string,
        transporter: Option,
    },
    officers: AreaDetailOfficer[],
    officers2: AreaDetailOfficer[],
    status: string,
    created_at: string,
    updated_at: string,
}

type Location = {
    id: number,
    name: string,
    status: string,
    created_at: string,
    updated_at: string
}

export type AreaDetail = Area & {
    locations: Location[]
}

type AddAreaOfficer = {
    staff_id: number;
    is_primary: number;
}

export type AddArea = Area & {
    council_id: number,
    driver_id: number,
    code: string,
    name: string,
    officers: AddAreaOfficer[],
    collection_frequency: string[],
    status: string,
}

export function formatOfficer(officers: any): AddAreaOfficer[] | [] { 
    if(officers as AreaDetailOfficer[]) {
        return officers.map((officer: AreaDetailOfficer) => {
            return {
                staff_id: officer.staff.id,
                is_primary: officer.is_primary,
            };
        });
    }
    else {
        return officers as AddAreaOfficer[];
    }
}
