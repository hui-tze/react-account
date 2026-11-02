import {loadToken} from "@/utils/token-utility";
import {BuildJsonHttpRequest} from "@/lib/request-util/http-request";
import {ApiEndpoint} from "@/config";
import useSWR, {type BareFetcher, type Key, type SWRConfiguration, type SWRResponse} from "swr";
import {BuildMultipartHttpRequest} from "@/lib/request-util/multipart-http-request";

export function useConsoleSwr<T>(key: Key, fetcher: BareFetcher<T> | null, config?: SWRConfiguration): SWRResponse<T> {
    return useSWR<T>(key ? `${ApiEndpoint}${key}` : null, fetcher, config);
}

function baseFetcher(url: string) {
    return BuildJsonHttpRequest().url(url);
}

export function authFetcher(url: string) {
    return baseFetcher(url).withToken(loadToken()).get();
}

export function fetcher(url: string) {
    return baseFetcher(url).get();
}

export function authMultipartApiRequest(path: string) {
    return BuildMultipartHttpRequest().url(`${ApiEndpoint}${path}`).withToken(loadToken());
}

export function authApiRequest(path: string) {
    return apiRequest(path).withToken(loadToken());
}

export function apiRequest(path: string) {
    return BuildJsonHttpRequest().url(`${ApiEndpoint}${path}`);
}

export function authApiRequestTempUrl<T>(path: string): Promise<T> {
    return apiRequest(path).withToken(loadToken()).get();
}