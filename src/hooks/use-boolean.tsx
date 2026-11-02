// Code referred from part of Chakra UI library: https://github.com/chakra-ui/chakra-ui/blob/main/packages/legacy/hooks/src/use-boolean.ts
import {useMemo, useState} from "react";

type UseBooleanInitialState = boolean | (() => boolean)

/**
 * React hook to manage boolean (on - off) states
 *
 * @param initialState the initial boolean state value
 *
 * @see Docs https://chakra-ui.com/docs/hooks/use-boolean
 */
export function useBoolean(initialState: UseBooleanInitialState = false) {
    const [value, setValue] = useState(initialState);
    const callbacks = useMemo(
        () => ({
            on: () => setValue(true),
            off: () => setValue(false),
            toggle: () => setValue((prev) => !prev),
        }),
        [],
    );
    return [value, callbacks] as const;
}
