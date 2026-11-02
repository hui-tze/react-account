import type {ErrResponse, UnprocessableEntityResponse} from "@/lib/request-util/request-utility";
import {loadToken, removeToken} from "@/utils/token-utility";

async function errorHandler(response: Response): Promise<string> {
    if (response.status === 401 && loadToken() != null) {
        removeToken();
        return "Username or Password incorrect";
    }

    if (response.status == 500) {
        return "Something went wrong";
    }

    if (response.status == 422) {
        return response.json().then((err: UnprocessableEntityResponse) => `${err.code} ${response.statusText}`);
    } else {
        try {
            return response.json().then((err: ErrResponse) => err.status);
        } catch (e) {
            return `${response.status} ${response.statusText}`;
        }
    }
}

export function handleErrorResponse(afterHandle: (message: string) => void) {
    return async (errorResponse: Response | string | object | unknown) => {
        //console.log(errorResponse);

        if (typeof errorResponse === "string") {
            afterHandle(errorResponse);
            return;
        }

        // Case: it's a fetch Response
        if (errorResponse instanceof Response) {
            const message = await errorHandler(errorResponse);
            afterHandle(message);
            return;
        }

        // Case: plain object (probably already JSON)
        if (typeof errorResponse === "object" && errorResponse !== null) {
            const errObj = errorResponse as Record<string, any>;
            const message = errObj.status || errObj.message || "Unknown error";
            afterHandle(message);
            return;
        }

        // Fallback
        afterHandle("Unexpected error");
    };
}
