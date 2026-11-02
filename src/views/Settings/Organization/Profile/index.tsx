import {ConditionalError} from "@/components/Display/ErrorBoundary";
import {useGetOwnUserProfile} from "@/apis/requests/user-profile-api";
import {useGetOneCompany} from "@/apis/requests/company-api";
import {useSmartTranslation} from "@/hooks/use-translation";
import {ProfileForm} from "./ProfileForm";

export const ORGANIZATION_PROFILE_PATH = "/settings/organization/profile";

/** Company profile of the user's working company — a single record, no listing. */
export default function OrganizationProfile() {
    const {t} = useSmartTranslation();
    const {data: profile, error: profileError} = useGetOwnUserProfile({revalidateOnFocus: false});
    const companyId = profile?.company_id;
    const {data: company, error: companyError, mutate} = useGetOneCompany(companyId, {revalidateOnFocus: false});

    if (profileError || companyError) {
        return <ConditionalError error={profileError ?? companyError} />;
    }

    if (profile && !companyId) {
        return (
            <div className="app-body">
                <div className="container-fluid py-3 text-muted">{t('noWorkingCompany')}</div>
            </div>
        );
    }

    if (!company) {
        return <div className="loader-pendulums mt-10" />;
    }

    // keyed by id so switching company remounts the form with fresh defaults
    return <ProfileForm key={company.id} company={company} onSaved={() => mutate()} />;
}
