import {authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {SelectOptionProps} from "../models/common";

export function useGetBankOptions(config?: SWRConfiguration): SWRResponse<SelectOptionProps[]> {
    return useConsoleSwr(`/sys-pub/bank-options`, authFetcher, config);
}