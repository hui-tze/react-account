import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {UserProfile} from "@/apis/models/user-profile";

/** The logged-in user's profile; `company_id` is the company this browser tab works in. */
export function useGetOwnUserProfile(config?: SWRConfiguration): SWRResponse<UserProfile> {
    return useConsoleSwr("/user-profile", authFetcher, config);
}

/** A company the user may work in. */
export type MyCompany = {
    id: number,
    code: string,
    name: string,
    role: string | null,
    // opened by default in a new session / tab
    is_default: boolean,
    // the company of this browser tab
    is_current: boolean,
};

export function useGetMyCompanies(config?: SWRConfiguration): SWRResponse<MyCompany[]> {
    return useConsoleSwr("/user-profile/companies", authFetcher, config);
}

/** Make a company the user's default (new sessions and tabs open in it). */
export function switchDefaultCompany(companyId: number): Promise<UserProfile> {
    return authApiRequest("/user-profile/switch-company").add({company_id: companyId}).put();
}
