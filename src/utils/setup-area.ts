import {useCallback} from "react";
import {NavigateOptions, To, useLocation, useNavigate} from "react-router-dom";

/*
 * Module settings screens (sales types, item categories, bank accounts, fiscal years…) are
 * mounted twice: inside their module at /<module>/setup/… and inside Settings at
 * /settings/<module>/…. The screens link to their module address; while the user is in Settings
 * those links are mapped to the Settings address so they stay there.
 */

const MODULE_SETUP = /^\/(sales|inventory|banking|gl)\/setup(?=[/?#]|$)/;

/** /sales/setup/sales-types → /settings/sales/sales-types (other paths unchanged). */
export function settingsPathOf(path: string): string {
    return path.replace(MODULE_SETUP, "/settings/$1");
}

export function inSettingsArea(pathname: string): boolean {
    return pathname === "/settings" || pathname.startsWith("/settings/");
}

/** Maps a module setup path to where the user currently is (module or Settings). */
export function useAreaPath(): (path: string) => string {
    const {pathname} = useLocation();
    return useCallback((path: string) => (inSettingsArea(pathname) ? settingsPathOf(path) : path), [pathname]);
}

/** useNavigate that keeps the user in Settings when they came through Settings. */
export function useAreaNavigate() {
    const navigate = useNavigate();
    const area = useAreaPath();
    return useCallback((to: To | number, options?: NavigateOptions) => {
        if (typeof to === "number") {
            return navigate(to);
        }
        return navigate(typeof to === "string" ? area(to) : {...to, pathname: to.pathname ? area(to.pathname) : to.pathname}, options);
    }, [navigate, area]);
}
