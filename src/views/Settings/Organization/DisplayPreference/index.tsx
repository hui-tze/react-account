import {ConditionalError} from "@/components/Display/ErrorBoundary";
import {useGetSystemSettings} from "@/apis/requests/system-setting-api";
import {DisplayPreferenceForm} from "./DisplayPreferenceForm";

export const DISPLAY_PREFERENCE_PATH = "/settings/organization/display-preference";

/** Company-wide formatting preferences (system settings category `display`). */
export default function DisplayPreference() {
    const {data, error, mutate} = useGetSystemSettings("display", {revalidateOnFocus: false});

    if (error) {
        return <ConditionalError error={error} />;
    }

    if (!data) {
        return <div className="loader-pendulums mt-10" />;
    }

    return <DisplayPreferenceForm settings={data} onSaved={() => mutate()} />;
}
