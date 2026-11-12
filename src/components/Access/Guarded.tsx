import {ComponentProps, forwardRef, ReactNode} from "react";
import {Button} from "react-bootstrap";
import {Link as RouterLink, LinkProps} from "react-router-dom";
import type {AccessAction} from "@/apis/requests/access-api";
import type {Permission, PermissionModule} from "@/constants/permissions";
import {useAccess} from "@/providers/access";
import {useAreaPath} from "@/utils/setup-area";

/*
 * Controls that only appear when the signed-in user's role allows them. The backend checks the
 * same permissions; these keep people from seeing what they can't use.
 */

type CanProps = {
    children: ReactNode,
    // shown instead when not allowed (default: nothing)
    otherwise?: ReactNode,
} & (
    | {permission: Permission | string, module?: never, action?: never}
    | {module: PermissionModule, action?: AccessAction, permission?: never}
    // the module of the screen being shown
    | {action: AccessAction, module?: never, permission?: never}
);

/** Renders its children only when allowed: a permission, a module + action, or an action on this screen's module. */
export function Can({children, otherwise = null, ...rule}: CanProps) {
    const {can, canModule, canHere} = useAccess();
    const allowed = rule.permission ? can(rule.permission)
        : rule.module ? canModule(rule.module, rule.action ?? "view")
            : canHere(rule.action ?? "view");
    return <>{allowed ? children : otherwise}</>;
}

/**
 * Link that respects access: a link to a create screen the user can't use disappears; a link to
 * a screen they can't open shows its text without the link. Drop-in for react-router's Link.
 */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(props, ref) {
    const {canPath} = useAccess();
    const area = useAreaPath();
    // module setup screens opened from Settings stay in Settings
    const target = typeof props.to === "string" ? area(props.to) : {...props.to, pathname: props.to.pathname ? area(props.to.pathname) : props.to.pathname};
    const to = typeof target === "string" ? target : (target.pathname ?? "") + (target.search ?? "");
    const isCreate = /\/create(\/|$|\?)/.test(to);

    if (!to || to.startsWith("#") || /^[a-z]+:/i.test(to) || canPath(to, isCreate ? "create" : "view")) {
        return <RouterLink ref={ref} {...props} to={target} />;
    }
    if (isCreate) {
        return null;
    }
    return <span className={typeof props.className === "string" ? props.className : undefined}>{props.children as ReactNode}</span>;
});

/** A button for an action on this screen's module (default "delete": void, cancel…); hidden when not allowed. */
export function ActionButton({action = "delete", ...props}: ComponentProps<typeof Button> & {action?: AccessAction}) {
    const {canHere} = useAccess();
    return canHere(action) ? <Button {...props} /> : null;
}
