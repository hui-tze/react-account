import {
    TOGGLE_COLLAPSED_NAV,
    TOGGLE_TOP_NAV
} from '../constants/Theme';
import { THEME_CONFIG } from '@/configs/ThemeConfig';

const initTheme = {
    ...THEME_CONFIG
};

interface ThemeAction {
    type: string;
    navCollapsed?: boolean;
    topNavCollapsed?: boolean;
    [extraProps: string]: unknown;
}

export const theme = (
    state = initTheme,
    action: ThemeAction
) => {
    switch (action.type) {
        case TOGGLE_COLLAPSED_NAV:
            return {
                ...state,
                navCollapsed: action.navCollapsed ?? state.navCollapsed
            };

        case TOGGLE_TOP_NAV:
            return {
                ...state,
                topNavCollapsed: action.topNavCollapsed ?? state.topNavCollapsed
            };

        default:
            return state;
    }
};