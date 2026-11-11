import type {SWRConfiguration, SWRResponse} from "swr";
import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";

type Id = number | string;

export type AccessAction = "view" | "create" | "edit" | "delete";

/** What the signed-in user may do in the company they work in. */
export type MyAccess = {
    member: boolean,
    is_admin: boolean,
    role: {id: number, name: string} | null,
    // "<module>.<action>", e.g. "sales_invoices.create"
    permissions: string[],
};

export type AccessRole = {
    id: number,
    name: string,
    description: string | null,
    is_system: boolean,
    // the company's Administrator: everything, can't be changed
    is_admin: boolean,
    user_count: number,
    permissions: string[],
    updated_at: string,
};

export type AccessCatalogue = {
    actions: AccessAction[],
    sections: {section: string, modules: {key: string, label: string, actions: AccessAction[]}[]}[],
    // modules whose records everyone can read (dropdowns on documents)
    open_reads: string[],
};

export type CompanyMember = {
    id: number,
    name: string,
    email: string,
    role_id: number | null,
    role_name: string | null,
    is_admin: boolean,
    status: "active" | "inactive",
    is_you: boolean,
    added_at: string,
};

export type RoleRequest = {name: string, description: string | null, permissions: string[]};
export type MemberRequest = {name: string, email?: string, password?: string | null, role_id: number | null, status?: "active" | "inactive"};

export const accessApi = {
    useMyAccess(config?: SWRConfiguration): SWRResponse<MyAccess> {
        return useConsoleSwr("/my-access", authFetcher, {revalidateOnFocus: false, ...config});
    },

    useCatalogue(): SWRResponse<AccessCatalogue> {
        return useConsoleSwr("/role/catalogue", authFetcher, {revalidateOnFocus: false});
    },
    useRoles(): SWRResponse<AccessRole[]> {
        return useConsoleSwr("/role", authFetcher);
    },
    useRole(id: Id | null | undefined): SWRResponse<AccessRole> {
        return useConsoleSwr(id ? `/role/${id}` : null, authFetcher, {revalidateOnFocus: false});
    },
    addRole: (data: RoleRequest): Promise<AccessRole> => authApiRequest("/role").add(data).post(),
    editRole: (id: Id, data: RoleRequest): Promise<AccessRole> => authApiRequest(`/role/${id}`).add(data).put(),
    deleteRole: (id: Id): Promise<void> => authApiRequest(`/role/${id}`).delete(),

    useMembers(params: string): SWRResponse<CompanyMember[]> {
        return useConsoleSwr(`/user-admin?${params}`, authFetcher);
    },
    addMember: (data: MemberRequest): Promise<CompanyMember> => authApiRequest("/user-admin").add(data).post(),
    editMember: (id: Id, data: MemberRequest): Promise<CompanyMember> => authApiRequest(`/user-admin/${id}`).add(data).put(),
    removeMember: (id: Id): Promise<void> => authApiRequest(`/user-admin/${id}`).delete(),
};
