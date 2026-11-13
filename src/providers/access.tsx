import {createContext, ReactNode, useContext, useMemo} from "react";
import {useLocation} from "react-router-dom";
import {accessApi, AccessAction, MyAccess} from "@/apis/requests/access-api";
import type {Permission, PermissionModule} from "@/constants/permissions";

/*
 * What the signed-in user may do (Settings → Roles & Access), for hiding menus, screens and
 * buttons. The backend enforces the same rules; this only keeps people from reaching what they
 * can't use.
 */

// screen path prefix → permission module (longest match wins); mirrors config/permissions.php
const PATH_MODULES: [string, PermissionModule][] = [
    ["/sales/quotations", "sales_quotations"],
    ["/sales/orders", "sales_orders"],
    ["/sales/deliveries", "deliveries"],
    ["/sales/invoices", "sales_invoices"],
    ["/sales/credit-notes", "customer_credit_notes"],
    ["/sales/payments", "customer_payments"],
    ["/sales/pos-receipts", "pos_receipts"],
    ["/sales/pos-credit-notes", "pos_credit_notes"],
    ["/sales/allocation", "customer_payments"],
    ["/sales/customers", "customers"],
    ["/sales/reports", "sales_reports"],
    ["/purchases/orders", "purchase_orders"],
    ["/purchases/receipts", "goods_receipts"],
    ["/purchases/bills", "supplier_bills"],
    ["/purchases/self-billed-invoices", "supplier_bills"],
    ["/purchases/credit-notes", "supplier_credit_notes"],
    ["/purchases/self-billed-credit-notes", "supplier_credit_notes"],
    ["/purchases/payments", "supplier_payments"],
    ["/purchases/allocation", "supplier_payments"],
    ["/purchases/suppliers", "suppliers"],
    ["/purchases/reports", "purchase_reports"],
    ["/inventory/items", "items"],
    ["/inventory/sales-pricing", "items"],
    ["/inventory/purchasing-pricing", "items"],
    ["/inventory/standard-costs", "items"],
    ["/inventory/reports", "inventory_reports"],
    ["/inventory", "inventory"],
    ["/banking", "banking"],
    ["/gl", "gl"],
    ["/einvoice", "einvoice"],
    ["/dimensions/budgets", "budgets"],
    ["/dimensions/budget-vs-actual", "budgets"],
    ["/dimensions/profit-loss", "budgets"],
    ["/dimensions/reports", "budgets"],
    ["/dimensions", "dimensions"],
    // module settings screens (Setup section of each module)
    ["/sales/setup", "settings"],
    ["/inventory/setup", "settings"],
    ["/banking/setup", "settings"],
    ["/gl/setup", "settings"],
    // MyInvois settings are saved through /einvoice/settings, an e-invoice permission
    ["/einvoice/settings", "einvoice"],
    ["/settings/einvoice", "einvoice"],
    ["/settings/user-management", "users"],
    ["/settings", "settings"],
];

/** The permission module a screen belongs to, or null for screens open to everyone. */
export function moduleOfPath(path: string): PermissionModule | null {
    const clean = path.split("?")[0];
    let best: [string, PermissionModule] | null = null;
    for (const rule of PATH_MODULES) {
        if ((clean === rule[0] || clean.startsWith(`${rule[0]}/`)) && (!best || rule[0].length > best[0].length)) {
            best = rule;
        }
    }
    return best?.[1] ?? null;
}

type AccessContextType = {
    access: MyAccess | null,
    isAdmin: boolean,
    can: (permission: Permission | string) => boolean,
    canModule: (module: PermissionModule | string, action?: AccessAction) => boolean,
    // the module of the screen being shown (e.g. a Void button on an invoice page)
    canHere: (action: AccessAction) => boolean,
    // a screen path: "view", or "create" for …/create pages
    canPath: (path: string, action?: AccessAction) => boolean,
    // a whole area (e.g. "/sales"): can the user open any screen in it
    canArea: (prefix: string) => boolean,
};

// until access loads (or for tests) everything is allowed; the backend still checks
const AccessContext = createContext<AccessContextType>({
    access: null, isAdmin: false, can: () => true, canModule: () => true, canHere: () => true, canPath: () => true, canArea: () => true,
});

export function AccessProvider({children}: {children: ReactNode}) {
    const {data, error} = accessApi.useMyAccess();
    const {pathname} = useLocation();

    const value = useMemo<AccessContextType>(() => {
        const set = new Set(data?.permissions ?? []);
        const isAdmin = !!data?.is_admin;
        const can = (permission: string) => !data || isAdmin || set.has(permission);
        const canModule = (module: string, action: AccessAction = "view") => can(`${module}.${action}`);
        const canHere = (action: AccessAction) => {
            const module = moduleOfPath(pathname);
            return !module || canModule(module, action);
        };
        const canPath = (path: string, action?: AccessAction) => {
            const module = moduleOfPath(path);
            const wanted = action ?? (/\/create(\/|$|\?)/.test(path) ? "create" : "view");
            return !module || canModule(module, wanted);
        };
        const canArea = (prefix: string) => {
            const own = moduleOfPath(prefix);
            const inside = PATH_MODULES.filter(([p]) => p.startsWith(`${prefix}/`)).map(([, m]) => m);
            if (own && !inside.length) {
                return canModule(own);
            }
            return !inside.length && !own ? true : [...inside, ...(own ? [own] : [])].some(m => canModule(m));
        };
        return {access: data ?? null, isAdmin, can, canModule, canHere, canPath, canArea};
    }, [data, pathname]);

    if (!data && !error) {
        return (
            <div className="preloader-it position-fixed">
                <div className="loader-pendulums" />
            </div>
        );
    }

    return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>;
}

export function useAccess() {
    return useContext(AccessContext);
}
