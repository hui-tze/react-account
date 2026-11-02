import {authApiRequest, authFetcher, useConsoleSwr} from "@/lib/request-client/client";
import type {SWRConfiguration, SWRResponse} from "swr";
import {DocumentNumbering, DocumentTypeOption} from "@/apis/models/document-numbering";
import {PaginationResponse} from "@/apis/pagination";

// next_number is maintained by the backend, not editable here
export type DocumentNumberingRequest = Omit<DocumentNumbering, "id" | "company_id" | "next_number">

// listing table — always sends `page`, so the backend paginates
export function useGetAllDocumentNumbering(params: URLSearchParams): SWRResponse<PaginationResponse<DocumentNumbering>> {
    return useConsoleSwr(`/document-numbering?${params}`, authFetcher);
}

export function useGetDocumentTypes(): SWRResponse<DocumentTypeOption[]> {
    return useConsoleSwr("/document-numbering/document-types", authFetcher, {revalidateOnFocus: false});
}

export function useGetOneDocumentNumbering(id: number | string, config?: SWRConfiguration): SWRResponse<DocumentNumbering> {
    return useConsoleSwr(`/document-numbering/${id}`, authFetcher, config);
}

export function addDocumentNumbering(data: DocumentNumberingRequest): Promise<DocumentNumbering> {
    return authApiRequest("/document-numbering").add(data).post();
}

export function updateDocumentNumbering(id: number | string, data: DocumentNumberingRequest): Promise<DocumentNumbering> {
    return authApiRequest(`/document-numbering/${id}`).add(data).put();
}

export function deleteDocumentNumbering(id: number | string): Promise<void> {
    return authApiRequest(`/document-numbering/${id}`).delete();
}
