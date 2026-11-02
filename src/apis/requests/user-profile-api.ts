import {authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {UserProfile} from "@/apis/models/user-profile";

/** The logged-in user's profile (carries the working `company_id`). */
export function useGetOwnUserProfile(config?: SWRConfiguration): SWRResponse<UserProfile> {
    return useConsoleSwr("/user-profile", authFetcher, config);
}
