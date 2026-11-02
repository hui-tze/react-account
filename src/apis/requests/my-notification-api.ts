import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {MyNotification} from "../models/my-notification";

export type NotificationResponse = {
    data: MyNotification[];
    meta: {
        count: number,
        next_cursor: string|null,
        prev_cursor: string|null,
    }
};
export type MarkAsReadRequest = {
    ids: number[],
    is_read: boolean,
};
export type UnreadNotification = {
    count: number
}

export function useGetAllNotification(): SWRResponse<NotificationResponse> {
    return useConsoleSwr(`/me/notification-center`, authFetcher);
}

export function useMarkNotificationAsRead(data: MarkAsReadRequest): Promise<{}> {
    return authApiRequest(`/me/notification-center/mark-as`).add(data).put();
}

export function useMarkAllNotificationAsRead(): Promise<{}> {
    return authApiRequest(`/me/notification-center/mark-all-as-read`).put();
}

export function useGetUnreadNotificationCount(config?: SWRConfiguration) {
    return useConsoleSwr<UnreadNotification>(`/me/notification-center/unread-count`, authFetcher, config);
}