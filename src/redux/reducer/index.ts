import {combineReducers} from "redux";
import {theme} from "./Theme";
import EmailReducer from "./Email";
import {ThemeConfig} from "@/configs/ThemeConfig";

export interface EmailState {
    composeEmail: boolean;
    maximize: boolean;
    minimize: boolean;
}

export const reducers = combineReducers({
    theme: theme,
});
export interface RootState {
    theme: ThemeConfig,
}
