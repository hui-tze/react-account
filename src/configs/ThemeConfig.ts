import {DEFAULT_LAYOUT_STYLE} from './constants/ThemeConstants';

export interface ThemeConfig {
    navCollapsed: boolean;
    dataHover: boolean;
    topNavCollapsed: boolean;
    layoutStyle: typeof DEFAULT_LAYOUT_STYLE;
}

export const THEME_CONFIG: ThemeConfig = {
    navCollapsed: true,
    dataHover: true,
    topNavCollapsed: false,
    layoutStyle: DEFAULT_LAYOUT_STYLE,
};