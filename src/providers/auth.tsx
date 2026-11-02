import {useNotification} from "@/hooks/notification";
import {createContext, type ReactNode, useContext, useEffect, useRef, useState} from "react";
import {loadToken, loadUser, loadPermissions, removeToken, saveToken, saveUser, savePermissions, saveLanguage, saveHourFormat} from "@/utils/token-utility";
import {handleErrorResponse} from "@/apis/response-handler";
import {attemptLogin, logout} from "@/apis/requests/auth-api";
import equal from "fast-deep-equal/es6/react";
import {LoggedInUser, SuccessfulLoginResponse} from "@/apis/models/auth";

type AuthContextType = {
    token: string | null ,
    signIn:  (code: string, username: string, password: string, onSuccess: (result:SuccessfulLoginResponse) => void, onFailure: (message:string) => void) => void,
    signOut: (callback: VoidFunction) => void,
    updateUser: (user: LoggedInUser) => void,
    updatePermissions: (permissions: string[]) => void,
}
 
const AuthContext = createContext<AuthContextType>(null!);

export function Auth({children}: { children: ReactNode }) {
    const {error} = useNotification();
    const [token, setToken] = useState<string | null >(loadToken());
    const [user, setUser] = useState<LoggedInUser | null>(loadUser());
    const [permissions, setPermissions] = useState<string[] | null>(loadPermissions());
    
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
        code: string,
        username: string,
        password: string,
        onSuccess: (result: SuccessfulLoginResponse) => void,
        onFailure: (message: string) => void
    ) => {
        try {
            console.log(username);
            console.log(password);
            const res = await attemptLogin(code, username, password);

            setToken(res.access_token);
            saveToken(res.access_token);
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

    const signOut = (callback: VoidFunction) => {
        logout()
            .then(() => {
                removeToken();
                setToken(null);
                callback();
            })
            .catch(handleErrorResponse((message) => {
                error(message);
            }));
    };

    const value = {token, signIn, signOut, updateUser, updatePermissions};

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}
