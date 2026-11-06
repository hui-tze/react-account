import type {AuthorizationRequest} from "./request-interface";
import {companyHeader} from "./request-utility";

export class MultipartRequest extends FormData implements AuthorizationRequest<MultipartRequest> {
    private destUrl: string;
    private token?: string | null;

    constructor() {
        super();
        this.destUrl = "";
    }

    /**
     * Set request url
     */
    url(url: string) {
        this.destUrl = url;
        return this;
    }

    /**
     *  Set api token
     */
    withToken(token: string | null): MultipartRequest {
        this.token = token ?? "";
        return this;
    }

    /**
     *  Add new key value
     */
    add(key: string, value: string | Blob, filename?: string | undefined) {
        if (filename) {
            this.append(key, value as Blob, filename);
        } else {
            this.append(key, value);
        }
        return this;
    }

    /**
     * Execute multipart request
     */
    execute<T>({onProgress = null}: { onProgress?: ((ev: ProgressEvent<EventTarget>) => void) | null } = {}): Promise<T> {
        return new Promise((resolve, reject) => {
            const request = new XMLHttpRequest();
            request.onload = () => {
                if (request.status >= 200 && request.status < 300) {
                    try {
                        resolve(JSON.parse(request.response));
                    } catch (e) {
                        resolve(request.response);
                    }
                } else {
                    try {
                        const errData = JSON.parse(request.response);
                        reject(`${errData.status} ${errData.message}`);
                    } catch (e) {
                        reject(`${request.status} ${request.statusText}`);
                    }
                }
            };
            if (onProgress != null) {
                request.upload.onprogress = onProgress;
            }
            request.onerror = () => {
                reject("Network Error");
            };
            request.open("POST", this.destUrl, true);
            if (this.token != null) {
                request.setRequestHeader("Authorization", `Bearer ${this.token}`);
                request.setRequestHeader("Accept", "application/json");
                Object.entries(companyHeader()).forEach(([key, value]) => request.setRequestHeader(key, value));
            }
            request.send(this);
        });
    }
}

export function BuildMultipartHttpRequest() {
    return new MultipartRequest();
}
