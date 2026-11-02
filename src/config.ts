export const Domain = import.meta.env.VITE_API_ENDPOINT ?? "http://localhost:8080";
export const ApiEndpoint = `${Domain}/api/panel`;

export const AuthTokenName = "account-login";
export const isProduction = import.meta.env.PROD;
