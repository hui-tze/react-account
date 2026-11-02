import {ConditionalError} from "@/components/Display/ErrorBoundary";
import {useGetSystemSettings} from "@/apis/requests/system-setting-api";
import {SystemSetupForm} from "./SystemSetupForm";

export const SYSTEM_SETUP_PATH = "/settings/organization/system-setup";

/** Company-wide operational defaults (system settings category `system_setup`). */
export default function SystemSetup() {
    const {data, error, mutate} = useGetSystemSettings("system_setup", {revalidateOnFocus: false});

    if (error) {
        return <ConditionalError error={error} />;
    }

    if (!data) {
        return <div className="loader-pendulums mt-10" />;
    }

    return <SystemSetupForm settings={data} onSaved={() => mutate()} />;
}
