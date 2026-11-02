import {useGetMe, useGetMyPermissions} from "@/apis/requests/auth-api";

export function usePermissionChecker() {
    const {data: permissions} = useGetMyPermissions();
    const {data: user} = useGetMe();

    const hasPermission = (permission: string): boolean => {
        if (!user || !permissions) return false;
        if (user.is_owner) return true;
        return permissions.includes(permission);
    };

    const isOwner = (): boolean => {
        if (!user) return false;
        return user.is_owner;
    };

    const isSupervisor = (): boolean => {
        if (!user) return false;
        return user.has_supervising_department;
    };

    const hasSupervisedAttendanceGroup = (): boolean => {
        if (!user) return false;
        return user.has_supervising_attendance_group;
    };

    const hasSubscription = (
        module: string | string[],
        mode: 'some' | 'all' = 'some'
    ): boolean => {
        if (!user) return false;

        const info = user.subscription_info as Record<string, any>;
        const modules = Array.isArray(module) ? module : [module];

        return mode === 'all'
            ? modules.every(m => Boolean(info[m]))
            : modules.some(m => Boolean(info[m]));
    };

    return {
        hasPermission,
        isOwner,
        isSupervisor,
        hasSupervisedAttendanceGroup,
        hasSubscription,
        permissionsLoaded: !!permissions && !!user,
    };
}