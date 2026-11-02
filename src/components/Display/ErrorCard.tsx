import type {FallbackProps} from "react-error-boundary";
import {NotFoundError, RequestError} from "@/lib/request-util/exception";
import {Alert} from "react-bootstrap";

type ErrorDetails = {
    code: string,
    message: string,
    details: string[],
}

export function getErrorDetails(error: FallbackProps["error"]): ErrorDetails {
    if (error instanceof RequestError) {
        return {
            code: error.requestException.code,
            message: error.requestException.message,
            details: error.requestException.details ?? []
        };
    }

    if (error instanceof NotFoundError) {
        return {
            code: "404",
            message: error.message,
            details: []
        };
    }

    return {
        code: "UNKNOWN",
        message: "Sorry, we're facing unexpected problem, please try again later",
        details: [],
    };
}

export type ErrorCardProps = {
    error: FallbackProps["error"],
}

export type ErrorMultiCardProps = {
    errors: (FallbackProps["error"])[],
}

export function ErrorCard({error}: ErrorCardProps) {
    const errorDetails = getErrorDetails(error);

    return (
        <Alert variant="danger">
            <ErrorCardContent errorDetails={errorDetails} />
        </Alert>
    );
}

export function ErrorMultiCard({errors}: ErrorMultiCardProps) {
    const allErrorDetails = makeUnique(errors.map(error => getErrorDetails(error)));

    return (
        <Alert variant="danger">
            {allErrorDetails.map((errorDetails, index) => (
                <ErrorCardContent key={index} errorDetails={errorDetails} />
            ))}
        </Alert>
    );
}

function makeUnique(errors: ErrorDetails[]) {
    const uniqueErrors: ErrorDetails[] = [];
    for (const error of errors) {
        const isExisted = uniqueErrors.some((uniqueError) => uniqueError.code == error.code);
        if (!isExisted) {
            uniqueErrors.push(error);
        }
    }

    return uniqueErrors;
}

type ErrorCardContentProps = {
    errorDetails: ErrorDetails,
}

function ErrorCardContent({errorDetails}: ErrorCardContentProps) {
    return (
        <div className="d-flex flex-column text-danger">
            <span className="fw-medium">[{errorDetails.code}]: {errorDetails.message}</span>
            <div className="d-flex flex-column">
                {errorDetails.details.map((detail, index) => (
                    <span key={index}>- {detail}</span>
                ))}
            </div>
        </div>
    );
}
