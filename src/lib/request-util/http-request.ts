import {AbstractRequest} from "./request-utility";
import type {DownloadRequest, FormRequest, JsonRequest} from "./request-interface";

class FormHttpRequest extends AbstractRequest implements FormRequest<FormHttpRequest> {
    constructor() {
        super("application/x-www-form-urlencoded", 'application/json');
    }

    add(key: string, value: string | number | boolean) {
        if (!this.isEmptyBody()) {
            this.body += "&";
        }
        this.body += `${key}=${encodeURIComponent(value)}`;
        return this;
    }
}

class JsonHttpRequest extends AbstractRequest implements JsonRequest<JsonHttpRequest> {
    constructor() {
        super("application/json;charset=UTF-8", "application/json");
    }

    add<U>(body: U) {
        this.body += JSON.stringify(body);
        return this;
    }
}

class DownloadHttpRequest extends AbstractRequest implements DownloadRequest {
    constructor() {
        super("application/octet-stream", "application/json");
    }

    download(): Promise<Blob> {
        return this.sendQueryRequest("GET", true);
    }
}

export function BuildFormHttpRequest() {
    return new FormHttpRequest();
}

export function BuildJsonHttpRequest() {
    return new JsonHttpRequest();
}

export function BuildJsonDownloadRequest() {
    return new DownloadHttpRequest();
}

export function saveBlobAs(blob: Blob, filename: string) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
}

export function viewBlob(blob: Blob) {
    window.open(URL.createObjectURL(blob), "_blank");
}
