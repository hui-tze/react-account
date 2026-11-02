import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {SystemSettingCategories} from "@/apis/models/system-setting";

export type SystemSettingCategory = keyof SystemSettingCategories;

export function useGetSystemSettings<C extends SystemSettingCategory>(category: C, config?: SWRConfiguration): SWRResponse<SystemSettingCategories[C]> {
    return useConsoleSwr(`/system-settings/${category}`, authFetcher, config);
}

export function saveSystemSettings<C extends SystemSettingCategory>(category: C, settings: Partial<SystemSettingCategories[C]>): Promise<SystemSettingCategories[C]> {
    return authApiRequest(`/system-settings/${category}`).add({settings}).put();
}
