import type {AccountUser, SuccessfulLoginResponse} from "@/apis/models/auth";
import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import {DeviceBind, UpdatePasswordRequest, UploadAvatarRequest, UserInfo, DepartmentInfo, SystemPrefRequest} from "../models/user";
import {PaginationResponse} from "../pagination";

export function useGetMe() {
    return useConsoleSwr<UserInfo>(`/me`, authFetcher, {
        revalidateOnFocus: false
    });
}

export function useGetMyPermissions() {
    return useConsoleSwr<string[]>(`/me/permissions`, authFetcher, {
        revalidateOnFocus: false
    });
}

export function useGetMyCurrentBindDevice() {
    return useConsoleSwr<DeviceBind>(`/me/device-binding/current`, authFetcher, {
        revalidateOnFocus: false
    });
}

export function useGetMySupervisingDepartment() {
    return useConsoleSwr<PaginationResponse<DepartmentInfo>>(`/me/supervising-organizations`, authFetcher, {
        revalidateOnFocus: false
    });
}

export function updatePassword(data: UpdatePasswordRequest) {
    return authApiRequest(`/change-password`).add(data).patch();
}

export function uploadMyAvatar(data: UploadAvatarRequest) {
    return authApiRequest(`/me/upload-avatar`).add(data).post();
}

export function setMyPreferredLanguage(data: SystemPrefRequest) {
    return authApiRequest(`/me/set-preferred-lang`).add(data).put();
}

export function attemptLogin(email: string, password: string): Promise<SuccessfulLoginResponse> {
    return authApiRequest(`/sign-in`)
        .add({
            email,
            password,
        })
        .post();
}

/** Lock screen: checks the signed-in user's password; the session token stays the same. */
export function unlockScreen(password: string) {
    return authApiRequest(`/unlock`)
        .add({password})
        .post();
}

/** The signed-in user (top bar). */
export function useGetCurrentUser() {
    return useConsoleSwr<AccountUser>(`/user`, authFetcher, {
        revalidateOnFocus: false
    });
}

export function logout() {
    return authApiRequest(`/sign-out`).post();
}
