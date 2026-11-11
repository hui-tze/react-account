import {AuthTokenName} from "@/config";
import {LoggedInUser} from "@/apis/models/auth";

export function saveToken(token: string) {
    localStorage.setItem(`${AuthTokenName}-token`, token);
}

export function loadToken(): string | null {
    return localStorage.getItem(`${AuthTokenName}-token`);
}

export function removeToken() {
    localStorage.removeItem(`${AuthTokenName}-token`);
}

export function saveUser(user: LoggedInUser) {
    localStorage.setItem(`${AuthTokenName}-user`, JSON.stringify(user));
}

export function loadUser(): LoggedInUser | null {
    const user = localStorage.getItem(`${AuthTokenName}-user`);
    if (user) {
        return JSON.parse(user);
    }
    return null;
}

export function removeUser() {
    localStorage.removeItem(`${AuthTokenName}-user`);
    localStorage.removeItem(`${AuthTokenName}-permissions`);
}

export function savePermissions(permissions: string[]) {
    localStorage.setItem(`${AuthTokenName}-permissions`, JSON.stringify(permissions));
}

export function loadPermissions(): string[] | null {
    const permissions = localStorage.getItem(`${AuthTokenName}-permissions`);
    if (permissions) {
        return JSON.parse(permissions);
    }
    return null;
}

export function saveLanguage(lang: string) {
    localStorage.setItem(`${AuthTokenName}-language`, lang);
}

export function loadLanguage(): string|null {
    return localStorage.getItem(`${AuthTokenName}-language`);
}

export function saveHourFormat(format: string) {
    localStorage.setItem(`${AuthTokenName}-hour-format`, format);
}

export function loadHourFormat(): string|null {
    return localStorage.getItem(`${AuthTokenName}-hour-format`);
}

// The company this browser tab works in, sent as X-Company-Id. Kept in sessionStorage so each
// tab can work in its own company; a new tab starts on the user's default company.
export function saveCompanyId(companyId: number) {
    sessionStorage.setItem(`${AuthTokenName}-company`, String(companyId));
}

export function loadCompanyId(): string | null {
    return sessionStorage.getItem(`${AuthTokenName}-company`);
}

export function removeCompanyId() {
    sessionStorage.removeItem(`${AuthTokenName}-company`);
}
