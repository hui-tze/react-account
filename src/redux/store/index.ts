import {legacy_createStore as createStore, Store, StoreEnhancer} from "redux";
import {reducers, RootState} from "../reducer";
import {THEME_CONFIG} from "@/configs/ThemeConfig";

declare global {
    interface Window {
        __REDUX_DEVTOOLS_EXTENSION__?: () => StoreEnhancer;
    }
}

const preloadedState: RootState = {
    theme: THEME_CONFIG,
};

const store: Store<RootState> = createStore(
    reducers,
    preloadedState,
    window.__REDUX_DEVTOOLS_EXTENSION__?.()
);

export default store;
