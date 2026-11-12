import {combineReducers} from "redux";
import {theme} from "./Theme";
import {ThemeConfig} from "@/configs/ThemeConfig";

export const reducers = combineReducers({
    theme: theme,
});
export interface RootState {
    theme: ThemeConfig,
}
