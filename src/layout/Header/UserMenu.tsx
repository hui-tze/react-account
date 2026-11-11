import {useState} from "react";
import {Dropdown, Spinner} from "react-bootstrap";
import {Briefcase, LogOut} from "react-feather";
import {useGetCurrentUser} from "@/apis/requests/auth-api";
import {useGetMyCompanies} from "@/apis/requests/user-profile-api";
import {useAuth} from "@/providers/auth";
import {useSmartTranslation} from "@/hooks/use-translation";

const initialsOf = (name: string | undefined) =>
    (name ?? "").split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0].toUpperCase()).join("") || "?";

/** Signed-in user in the top bar: who is signed in, in which company, and Sign out. */
export function UserMenu() {
    const {t} = useSmartTranslation();
    const auth = useAuth();
    const {data: user} = useGetCurrentUser();
    const {data: companies} = useGetMyCompanies({revalidateOnFocus: false});
    const [signingOut, setSigningOut] = useState(false);
    const company = companies?.find(c => c.is_current);

    const signOut = () => {
        setSigningOut(true);
        // a full reload to the login page: nothing cached for this user survives
        auth.signOut(() => window.location.assign("/"));
    };

    return (
        <Dropdown align="end" className="ps-2">
            <Dropdown.Toggle as="button" type="button" className="btn btn-icon btn-rounded btn-flush-dark no-caret p-0" aria-label={t('accountMenu')}>
                <div className="avatar avatar-primary avatar-xs avatar-rounded">
                    <span className="initial-wrap">{initialsOf(user?.name)}</span>
                </div>
            </Dropdown.Toggle>

            <Dropdown.Menu style={{minWidth: 260}}>
                <div className="px-3 py-2">
                    <div className="d-flex align-items-center gap-2">
                        <div className="avatar avatar-primary avatar-sm avatar-rounded flex-shrink-0">
                            <span className="initial-wrap">{initialsOf(user?.name)}</span>
                        </div>
                        <div className="min-w-0">
                            <div className="fw-semibold text-dark text-truncate">{user?.name ?? "…"}</div>
                            <div className="small text-muted text-truncate">{user?.email}</div>
                        </div>
                    </div>
                    {company && (
                        <div className="small text-muted d-flex align-items-center gap-1 mt-2">
                            <Briefcase size={13} />
                            <span className="text-truncate">{company.name}</span>
                        </div>
                    )}
                </div>

                <Dropdown.Divider as="div" />

                <Dropdown.Item as="button" type="button" onClick={signOut} disabled={signingOut} className="d-flex align-items-center text-danger">
                    <span className="dropdown-icon feather-icon">
                        {signingOut ? <Spinner animation="border" size="sm" /> : <LogOut />}
                    </span>
                    <span>{t('signOut')}</span>
                </Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    );
}
