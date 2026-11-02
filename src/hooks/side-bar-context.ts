import {createContext, useContext} from "react";

export type SubSideBarContextState = {
    showSidebar: boolean,
    toggleShowSidebar: () => void,
}

export const SubSideBarContext = createContext<SubSideBarContextState>({
    showSidebar: true,
    toggleShowSidebar: () => {},
});

export function useSubSideBarContext() {
    return useContext(SubSideBarContext);
}
