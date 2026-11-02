import {createContext, ReactNode, useContext, useState} from "react";

export type NewAccountTriggerValue = {
    nonce: number,
    requestNewAccount: () => void,
}

const NewAccountTriggerContext = createContext<NewAccountTriggerValue>({
    nonce: 0,
    requestNewAccount: () => {},
});

export function NewAccountTriggerProvider({children}: {children: ReactNode}) {
    const [nonce, setNonce] = useState(0);

    return (
        <NewAccountTriggerContext.Provider value={{nonce, requestNewAccount: () => setNonce(n => n + 1)}}>
            {children}
        </NewAccountTriggerContext.Provider>
    );
}

export function useNewAccountTrigger() {
    return useContext(NewAccountTriggerContext);
}
