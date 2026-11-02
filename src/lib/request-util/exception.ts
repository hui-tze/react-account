export type RequestException = {
    code: string,
    message: string,
    details?: string[],
}

export class RequestError extends Error {
    constructor(public httpCode: number, public requestException: RequestException) {
        super(requestException.message);
    }
}

export class NotFoundError extends Error {
    constructor(message: string, public details: string) {
        super(message);
    }
}
