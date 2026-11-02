import {authMultipartApiRequest} from "@/lib/request-client/client";

export type UploadFileRequest = {
    files: File[],
}

export type UploadImageWithCompressionRequest = {
    files: File[],
    resize_width?: number,
    resize_height?: number,
}

export function useUploadFile(data: UploadFileRequest): Promise<void> {
    const r = authMultipartApiRequest(`/upload`);

    for (const file of data.files) {
        r.add("files[]", file);
    }

    return r.execute();
}

export function useUploadImageWithCompression(data: UploadImageWithCompressionRequest): Promise<void> {
    const r = authMultipartApiRequest(`/upload/image`);

    const { files, ...params } = data;
    
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            r.add(key, value.toString());
        }
    });

    // Add files
    for (const file of files) {
        r.add("files[]", file);
    }

    return r.execute();
}