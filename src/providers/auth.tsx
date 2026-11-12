import {useNotification} from "@/hooks/notification";
import {createContext, type ReactNode, useContext, useEffect, useRef, useState} from "react";
import {loadToken, loadUser, loadPermissions, removeCompanyId, removeToken, removeUser, saveToken, saveUser, savePermissions} from "@/utils/token-utility";
import {handleErrorResponse} from "@/apis/response-handler";
import {attemptLogin, logout, unlockScreen} from "@/apis/requests/auth-api";
import equal from "fast-deep-equal/es6/react";
import {LoggedInUser, SuccessfulLoginResponse} from "@/apis/models/auth";
import {resetIdleLock, useIdleLock} from "@/hooks/use-idle-lock";

type AuthContextType = {
    token: string | null ,
    signIn: (email: string, password: string, onSuccess: (result:SuccessfulLoginResponse) => void, onFailure: (message:string) => void) => void,
    signOut: (callback: VoidFunction) => void,
    updateUser: (user: LoggedInUser) => void,
    updatePermissions: (permissions: string[]) => void,
    /** true while the idle lock screen is showing */
    locked: boolean,
    lock: VoidFunction,
    /** resolves when the password is right; rejects with a message otherwise */
    unlock: (password: string) => Promise<void>,
}

async function errorMessage(err: unknown): Promise<string> {
    if (typeof err === "string") return err;
    if (err instanceof Response) {
        if (err.status === 429) return "Too many attempts. Please wait a minute and try again.";
        try {
            const body = await err.json();
            return body?.message ?? body?.status ?? `${err.status} ${err.statusText}`;
        } catch {
            return `${err.status} ${err.statusText}`;
        }
    }
    if (err instanceof Error) return err.message;
    return "Unexpected error";
}
 
const AuthContext = createContext<AuthContextType>(null!);

export function Auth({children}: { children: ReactNode }) {
    const {error} = useNotification();
    const [token, setToken] = useState<string | null >(loadToken());
    const [user, setUser] = useState<LoggedInUser | null>(loadUser());
    const [permissions, setPermissions] = useState<string[] | null>(loadPermissions());
    const idle = useIdleLock(token != null);

    const unlock = async (password: string) => {
        try {
            await unlockScreen(password);
            idle.unlock();
        } catch (err) {
            throw await errorMessage(err);
        }
    };

    const updateUser = (newUserData: LoggedInUser) => {
        if(! equal(newUserData, user)) {
            setUser(newUserData);
            saveUser(newUserData);
        }
    };

    const updatePermissions = (newPermissionData: string[]) => {
        if(! equal(newPermissionData, permissions)) {
            setPermissions(newPermissionData);
            savePermissions(newPermissionData);
        }
    };

    const signIn = async (
        email: string,
        password: string,
        onSuccess: (result: SuccessfulLoginResponse) => void,
        onFailure: (message: string) => void
    ) => {
        try {
            const res = await attemptLogin(email, password);

            setToken(res.access_token);
            saveToken(res.access_token);
            resetIdleLock();
            // a new session starts on the user's default company
            removeCompanyId();
            //saveHourFormat(res.user.branch.hour_format);

            //const lang = res.user.preferred_lang;
            //saveLanguage(lang);
            //await applyLanguage(lang);

            //updateUser(res.user);
            //updatePermissions(res.permissions);

            onSuccess(res);
        } catch (err) {
            await handleErrorResponse((message) => {
                error(message);
                onFailure(message);
            })(err);
        }
    };

    // the session ends in this browser even when the server call fails (e.g. the token already expired)
    const signOut = (callback: VoidFunction) => {
        logout()
            .catch(() => undefined)
            .then(() => {
                removeToken();
                removeUser();
                removeCompanyId();
                resetIdleLock();
                setToken(null);
                setUser(null);
                setPermissions(null);
                callback();
            });
    };

    const value = {token, signIn, signOut, updateUser, updatePermissions, locked: idle.locked, lock: idle.lock, unlock};

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}
