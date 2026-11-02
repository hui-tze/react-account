import type {AuthorizationRequest, RequestBuilderInterface} from "./request-interface";
import {loadToken, removeToken} from "@/utils/token-utility";
import {NotFoundError, RequestError, RequestException} from "@/lib/request-util/exception";


export type ErrResponse = {
    status_code: string;
    status: string;
}

export type UnprocessableEntityResponse = {
    code: string
    details: {
        field: string,
        message: string
    }[]
}

class BaseRequestBuilder implements AuthorizationRequest<BaseRequestBuilder>, RequestBuilderInterface<BaseRequestBuilder> {
    protected body: string;
    protected destUrl: string;
    protected token?: string | null;

    constructor() {
        this.body = "";
        this.destUrl = "";
    }

    url(url: string, queryParam?: string | null) {
        if (queryParam && queryParam.length != 0) {
            this.destUrl = `${url}?${queryParam}`;
        } else {
            this.destUrl = url;
        }
        return this;
    }

    withToken(token: string | null) {
        this.token = token ?? "";
        return this;
    }

    getBody(): string {
        return this.body;
    }

    clear() {
        this.destUrl = "";
        this.body = "";
    }

    isEmptyBody(): boolean {
        return this.body === "";
    }
}

export abstract class AbstractRequest extends BaseRequestBuilder {
    protected contentType: string;
    protected accept: string;
    options: RequestInit;

    protected constructor(contentType: string, accept: string) {
        super();
        this.contentType = contentType;
        this.accept = accept;
        this.options = {
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        };
        // Default options are marked with *
    }

    /**
     * Execute GET request
     */
    get() {
        return this.sendQueryRequest("GET");
    }

    /**
     * Execute POST request
     */
    post() {
        return this.sendFormEncodedRequest("POST");
    }

    /**
     * Execute PUT request
     */
    put() {
        return this.sendFormEncodedRequest("PUT");
    }

    /**
     * Execute PATCH request
     */
    patch() {
        return this.sendFormEncodedRequest("PATCH");
    }

    /**
     * Execute DELETE request
     */
    delete() {
        return this.sendQueryRequest("DELETE");
    }

    sendQueryRequest(method: string, isDownload?: boolean) {
        this.options.method = method;
        this.options.headers = {
            'Accept': 'application/json',
        };
        if (this.token != null) {
            this.options.headers = {...this.options.headers, 'Authorization': `Bearer ${this.token}`};
        }

        const query = this.isEmptyBody() ? "" : `?${this.body}`;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return new Promise<any>((resolve, reject) => {
            fetch(this.destUrl + query, this.options)
                .then(response => this.processResponse(response, resolve, reject, isDownload))
                .catch(e => {
                    reject(e.message);
                });
        });
    }

    sendFormEncodedRequest(method: string) {
        this.options.method = method;
        this.options.headers = {
            'Accept': this.accept,
            'Content-Type': this.contentType,
        };
        if (this.token != null) {
            this.options.headers = {...this.options.headers, 'Authorization': `Bearer ${this.token}`};
        }
        this.options.body = this.body;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return new Promise<any>((resolve, reject) => {
            fetch(this.destUrl, this.options)
                .then(response => {
                    this.processResponse(response, resolve, reject);
                })
                .catch(e => {
                    console.log('Fetch error:', e);
                    reject(e.message);
                });
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    processResponse(response: Response, resolve: (value: any) => void, reject: (reason?: any) => void, isDownload?: boolean) {
        if (response.ok) {
            switch (response.status) {
                case 201: {
                    return resolve(response.json());
                }
                case 204: {
                    return resolve("Success");
                }
                default: {
                    return isDownload ? resolve(response.blob()) : resolve(response.json());
                }
            }
        } else {
            switch (response.status) {
                // case 422: {
                //     return reject("Unprocessable Content");
                // }
                // case 400: {
                //     return reject("Bad Request");
                // }
                // case 403: {
                //     return reject("Forbidden");
                // }
                // case 405: {
                //     return reject("Method Not Allowed");
                // }
                case 404: {
                    response
                        .json()
                        .then((json) => {
                            const details = JSON.stringify(json, null, 4);
                            const error = new NotFoundError("Not Found", details);
                            reject(error);
                        })
                        .catch(() => {
                            response
                                .text()
                                .then((text) => {
                                    const error = new NotFoundError("Not Found", text);
                                    reject(error);
                                });
                        });

                    return;
                }
                // case 409: {
                //     return response.json()
                //         .then((r) => {
                //             reject(r.status + ': ' + r.message);
                //         });
                // }
                case 401: {
                    if (loadToken() != null) {
                        removeToken();
                        location.reload();
                    }
                    return response.json()
                        .then((r: ErrResponse) => {
                            reject(r.status);
                        });
                    // return response.json()
                    //     .then((r: ErrResponse) => {
                    //         reject(r.status);
                    //     });
                }
                default: {
                    return response.json()
                        .then((e: RequestException) => {
                            const error = new RequestError(response.status, e);
                            reject(error);
                        });
                }
            }
        }
    }
}
