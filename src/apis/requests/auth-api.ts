import type {SuccessfulLoginResponse} from "@/apis/models/auth";
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

export function attemptLogin(code: string, email: string, password: string): Promise<SuccessfulLoginResponse> {
    return authApiRequest(`/sign-in`)
        .add({
            code,
            email,
            password,
        })
        .post();
}

export function logout() {
    return authApiRequest(`/sign-out`).post();
}
