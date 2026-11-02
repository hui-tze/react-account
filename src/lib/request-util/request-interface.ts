export interface AuthorizationRequest<T> {
    /**
     * Set api token
     */
    withToken(token: string | null): T;
}

export interface RequestBuilderInterface<T> {
    /**
     * Set request url and optional query parameter
     */
    url(url: string, queryParam: string | null): T;

    /**
     * Get the current request body string
     */
    getBody(): string;

    /**
     * Clear reset the request
     */
    clear(): void;

    /**
     * Check if the request body is empty
     */
    isEmptyBody(): boolean;
}

export interface FormRequest<T> {
    /**
     * Add key value into request body
     */
    add(key: string, value: string | number | boolean): T;
}

export interface JsonRequest<T> {
    /**
     * Add json request body
     */
    add<U>(body: U): T;
}

export interface DownloadRequest {
    /**
     * method to download blob
     */
    download(): Promise<Blob>;
}
