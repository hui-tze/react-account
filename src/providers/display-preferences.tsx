import {Fragment, ReactNode, useMemo} from "react";
import {useGetSystemSettings} from "@/apis/requests/system-setting-api";
import {setDisplaySettings} from "@/utils/display-format";

/**
 * Loads the company's Display Preference before the signed-in app renders, so every number and
 * date follows it. Saving the settings page updates the same cached settings; the app below is
 * then re-mounted to pick the new formats up everywhere.
 */
export function DisplayPreferences({children}: {children: ReactNode}) {
    const {data, error} = useGetSystemSettings("display", {revalidateOnFocus: false});

    const version = useMemo(() => {
        setDisplaySettings(data);
        return JSON.stringify(data ?? null);
    }, [data]);

    // without settings (e.g. the request failed) the defaults apply
    if (!data && !error) {
        return (
            <div className="preloader-it position-fixed">
                <div className="loader-pendulums" />
            </div>
        );
    }

    return <Fragment key={version}>{children}</Fragment>;
}
