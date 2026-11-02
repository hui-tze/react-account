import {authApiRequest, authFetcher, fetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration} from "swr";
import {LeaveExclusionEvent, PublicHoliday, SubscribedHoliday} from "../models/leave-exclusion-event";
import {LeaveConfig} from "../models/leave-config";
import useSWR from "swr";

export type LeaveExclusionEventCreateRequest = Omit<LeaveExclusionEvent, 'id'|'leave_conf_id'|'uid'|'recurring_uid'|'recurring'> & {
    leave_config_ids: number[],
    recurring_type: 'none'|'yearly'|'monthly'|'weekly'|'daily',
    recurring_until_date: string,
};
export type LeaveExclusionEventUpdateRequest = LeaveExclusionEventCreateRequest & {
    recurring_modify_type: 'current'|'all'|'current-and-after',
}
export type LeaveExclusionEventWithDetails = LeaveExclusionEvent & {
    configs: LeaveConfig[],
}
export type LeaveExclusionEventDeleteRequest = {
    recurring_modify_type: 'current'|'all'|'current-and-after',
}
export type ImportHolidaysRequest = {
    auto: boolean,
    country: string,
    state: string,
    events: {
        holiday_name: string,
        full_date: string,
    }[]
}
export type UpdateSubscribedHolidayRequest = {
    auto: boolean
}

export function useGetLeaveExclusionEventCalendar(params: URLSearchParams, config?: SWRConfiguration) {
    return useConsoleSwr<LeaveExclusionEvent[]>(`/leave-exclusion-events/calendar?${params}`, authFetcher, config);
}

export function useGetOneLeaveExclusionEvent(id: number|string, config?: SWRConfiguration) {
    return useConsoleSwr<LeaveExclusionEventWithDetails>(`/leave-exclusion-events/${id}`, authFetcher, config);
}

export function createLeaveExclusionEvent(data: LeaveExclusionEventCreateRequest): Promise<LeaveExclusionEvent> {
    return authApiRequest("/leave-exclusion-events").add(data).post();
}

export function updateLeaveExclusionEvent(id: number|string, data: LeaveExclusionEventUpdateRequest): Promise<LeaveExclusionEvent> {
    return authApiRequest(`/leave-exclusion-events/${id}`).add(data).put();
}

export function deleteLeaveExclusionEvent(id: number|string, data: LeaveExclusionEventDeleteRequest): Promise<[]> {
    const params = new URLSearchParams({ recurring_modify_type: data.recurring_modify_type }).toString();
    return authApiRequest(`/leave-exclusion-events/${id}?${params}`).delete();
}

export function useGetPublicHolidays(year?: string, state?: string, config?: SWRConfiguration) {
    const url = year && state
            ? `https://www.byotime.com/papi/holidays/malaysia/${state}/${year}.json`
            : null;

    return useSWR<PublicHoliday[]>(url, fetcher, config);
}

export async function getPublicHolidaysRequest(year: string, state?: string): Promise<PublicHoliday[]> {
    const res = await fetch(
        `https://www.byotime.com/papi/holidays/malaysia/${state}/${year}.json`
    );

    return res.json();
}

export function useGetPublicHolidayYears(config?: SWRConfiguration) {
    const url = "https://www.byotime.com/papi/holidays/malaysia/years.json";

    return useSWR<number[]>(url, fetcher, config);
}

export function useImportHolidays(data: ImportHolidaysRequest): Promise<[]> {
    return authApiRequest("/leave-exclusion-events/import-holidays").add(data).post();
}

export function useGetSubscribedHolidays(config?: SWRConfiguration) {
    return useConsoleSwr<SubscribedHoliday[]>(`/leave-exclusion-events/subscribed`, authFetcher, config);
}

export function useUpdateSubscribedHolidays(id: number|string, data: UpdateSubscribedHolidayRequest): Promise<[]> {
    return authApiRequest(`/leave-exclusion-events/subscribed/${id}`).add(data).put();
}

export function useDeleteSubscribedHoliday(id: number|string): Promise<[]> {
    return authApiRequest(`/leave-exclusion-events/subscribed/${id}`).delete();
}