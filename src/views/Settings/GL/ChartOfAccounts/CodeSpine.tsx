import {ChevronRight} from "react-feather";
import {AccountClass} from "@/apis/models/account-class";
import {AccountGroup} from "@/apis/models/account-group";
import {Account} from "@/apis/models/account";
import {useSmartTranslation} from "@/hooks/use-translation";

export type CodeSpineProps = {
    query: string,
    selectedClass: AccountClass | null,
    selectedGroup: AccountGroup | null,
    selectedAccount: Account | null,
}

export default function CodeSpine({query, selectedClass, selectedGroup, selectedAccount}: CodeSpineProps) {
    const {t} = useSmartTranslation();

    return (
        <div className="coa-spine d-flex align-items-center gap-2 flex-wrap mt-3">
            <span className="text-uppercase text-muted fw-semibold coa-spine-label">{t('codePath')}</span>
            {query ? (
                <span className="text-muted fst-italic small">
                    {t('searchResultsHint', {query})}
                </span>
            ) : (
                <div className="d-flex align-items-center gap-1 flex-wrap">
                    {selectedClass && (
                        <span className={`coa-seg${!selectedGroup ? " is-live" : ""}`}>
                            {selectedClass.code} <em>{selectedClass.name}</em>
                        </span>
                    )}
                    {selectedGroup && (
                        <>
                            <ChevronRight size={13} className="text-muted" />
                            <span className={`coa-seg${!selectedAccount ? " is-live" : ""}`}>
                                {selectedGroup.code} <em>{selectedGroup.name}</em>
                            </span>
                        </>
                    )}
                    {selectedAccount && (
                        <>
                            <ChevronRight size={13} className="text-muted" />
                            <span className="coa-seg is-live">
                                {selectedAccount.account_code} <em>{selectedAccount.account_name}</em>
                            </span>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
