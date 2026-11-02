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