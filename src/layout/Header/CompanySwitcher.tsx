import {useEffect, useState} from "react";
import {Badge, Dropdown, Spinner} from "react-bootstrap";
import {Briefcase, Check} from "react-feather";
import {switchDefaultCompany, useGetMyCompanies} from "@/apis/requests/user-profile-api";
import {useSmartTranslation} from "@/hooks/use-translation";
import {loadCompanyId, saveCompanyId} from "@/utils/token-utility";

/**
 * Company picker in the top bar. Each browser tab works in its own company (sent as
 * X-Company-Id); switching also makes that company the default for new sessions.
 * Hidden when the user belongs to only one company.
 */
export function CompanySwitcher() {
    const {t} = useSmartTranslation();
    const {data: companies} = useGetMyCompanies({revalidateOnFocus: false});
    const [switching, setSwitching] = useState(false);
    const current = companies?.find(c => c.is_current);

    // pin this tab to the company it opened in, so a switch in another tab doesn't move it
    useEffect(() => {
        if (current && !loadCompanyId()) {
            saveCompanyId(current.id);
        }
    }, [current]);

    if (!companies || companies.length <= 1) {
        return null;
    }

    const choose = async (companyId: number) => {
        if (companyId === current?.id) {
            return;
        }
        setSwitching(true);
        saveCompanyId(companyId);
        try {
            await switchDefaultCompany(companyId);
        } catch {
            // the tab still switches; only the saved default stays as it was
        }
        // start clean: no screen or cached data of the previous company survives
        window.location.assign("/dashboard");
    };

    return (
        <Dropdown align="end" className="me-2 d-flex align-items-center">
            <Dropdown.Toggle variant="flush-dark" className="btn-rounded flush-soft-hover d-flex align-items-center gap-2 company-switcher-toggle"
                disabled={switching}>
                {switching ? <Spinner animation="border" size="sm" /> : <Briefcase size={16} />}
                <span className="text-truncate d-none d-md-inline" style={{maxWidth: 220}}>{current?.name ?? t('selectCompany')}</span>
            </Dropdown.Toggle>
            <Dropdown.Menu style={{minWidth: 260}}>
                <Dropdown.Header>{t('switchCompany')}</Dropdown.Header>
                {companies.map(company => (
                    <Dropdown.Item key={company.id} onClick={() => choose(company.id)} active={company.is_current}
                        className="d-flex align-items-center gap-2">
                        <span className="flex-grow-1 text-truncate">
                            {company.name}
                            <span className="d-block small text-muted">{company.code}{company.role ? ` · ${company.role}` : ""}</span>
                        </span>
                        {company.is_default && <Badge bg="light" className="badge-soft-secondary">{t('defaultCompany')}</Badge>}
                        {company.is_current && <Check size={14} />}
                    </Dropdown.Item>
                ))}
            </Dropdown.Menu>
        </Dropdown>
    );
}
