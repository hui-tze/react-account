import {
    TOGGLE_COLLAPSED_NAV,
    TOGGLE_TOP_NAV
} from '../constants/Theme';

export type ToggleCollapsedNavAction = {
    type: typeof TOGGLE_COLLAPSED_NAV,
    navCollapsed: boolean,
};

export type ToggleTopNavAction = {
    type: typeof TOGGLE_TOP_NAV,
    topNavCollapsed: boolean,
};

export type ThemeAction = ToggleCollapsedNavAction | ToggleTopNavAction;

/** Collapses / expands the sidebar (desktop: icons-only mode; phones: shows / hides it). */
export function toggleCollapsedNav(navCollapsed: boolean): ToggleCollapsedNavAction {
    return {
        type: TOGGLE_COLLAPSED_NAV,
        navCollapsed
    };
}

export function toggleTopNav(topNavCollapsed: boolean): ToggleTopNavAction {
    return {
        type: TOGGLE_TOP_NAV,
        topNavCollapsed
    };
}
