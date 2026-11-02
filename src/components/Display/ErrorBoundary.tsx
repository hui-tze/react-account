import {type FallbackProps, useErrorBoundary } from "react-error-boundary";
import {Button, Col, Container, Row} from "react-bootstrap";
import fatalErrorImg from "@/assets/img/macaroni-fatal-error.png";
import {NotFoundError, RequestError} from "@/lib/request-util/exception";
import {isProduction} from "@/config";

function getStack(error: FallbackProps["error"]) {
    if (error instanceof NotFoundError) {
        return error.details;
    }

    if (error instanceof Error) {
        return error.stack;
    }

    return "";
}

type ErrorDisplayProps = {
    code: string,
    message: string,
    details: string[],
    canRetry?: boolean,
}

function ErrorDisplay({code, message, details, canRetry}: ErrorDisplayProps) {
    const { resetBoundary } = useErrorBoundary();

    return (
        <div className="auth-content py-8">
            <div className="w-100">
                <Row>
                    <Col xxl={9} xl={8} lg={11}>
                        <h1 className="display-4 fw-bold mb-2">{code}</h1>
                        <p className="p-lg">{message}</p>
                        <div className="d-flex flex-column">
                            {details.map((detail, index) => (
                                <span key={index}>- {detail}</span>
                            ))}
                        </div>
                        {canRetry && (
                            <Button
                                variant="primary"
                                className="mt-4"
                                onClick={() => {
                                    resetBoundary();
                                }}
                            >
                                Retry
                            </Button>
                        )}
                    </Col>
                </Row>
            </div>
        </div>
    );
}

export function ConditionalErrorContent({error}: Omit<FallbackProps, "resetErrorBoundary">) {
    if (error instanceof RequestError) {
        return (
            <ErrorDisplay
                code={error.requestException.code}
                message={error.requestException.message}
                details={error.requestException.details ?? []}
            />
        );
    }

    if (error instanceof NotFoundError) {
        return (
            <ErrorDisplay
                code="404"
                message={error.message}
                details={[]}
            />
        );
    }

    if (error instanceof Error) {
        return (
            <ErrorDisplay
                code="UNKNOWN"
                message="Sorry, we're facing unexpected problem, please try again later"
                details={[error.message]}
                canRetry
            />
        );
    }

    return (
        <ErrorDisplay
            code="UNKNOWN"
            message="Sorry, we're facing unexpected problem, please try again later"
            details={[]}
            canRetry
        />
    );
}

export function ConditionalError({error}: Omit<FallbackProps, "resetErrorBoundary">) {
    return (
        <Container>
            <div className="hk-pg-body">
                <Row>
                    <Col xl={7} lg={6} className="d-lg-block d-none">
                        <div className="auth-content py-md-0 py-8">
                            <Row>
                                <Col xl={12} className="text-center">
                                    <img src={fatalErrorImg} className="img-fluid w-sm-80 w-50" alt="login" />
                                </Col>
                            </Row>
                        </div>
                    </Col>
                    <Col xl={5} lg={6} md={7} sm={10}>
                        <ConditionalErrorContent error={error}/>
                    </Col>
                </Row>
                {!isProduction && (
                    <div className="my-2 px-3 py-2 bg-grey-light-5 d-flex flex-column">
                        <span className="fw-bold">Dev Stack: </span>
                        <pre className="text-red">{getStack(error)}</pre>
                    </div>
                )}
            </div>
        </Container>
    );
}

export function generalFallbackRenderer({error}: FallbackProps) {
    return <ConditionalError error={error} />;
}
