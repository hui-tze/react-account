import {Badge, Button, Card, Form, ListGroup} from "react-bootstrap";
import {Plus, Search, X} from "react-feather";
import {Account} from "@/apis/models/account";
import {AccountGroup} from "@/apis/models/account-group";
import {AccountClass} from "@/apis/models/account-class";
import {useSmartTranslation} from "@/hooks/use-translation";
import {getAccountTypeLabel} from "@/constants/AccountType";

export type AccountListProps = {
    accounts: Account[],
    groups: AccountGroup[],
    classes: AccountClass[],
    selectedId: number | null,
    query: string,
    onQueryChange: (value: string) => void,
    onSelect: (id: number) => void,
    onCreate: () => void,
    selectedGroup: AccountGroup | null,
}

export default function AccountList({accounts, groups, classes, selectedId, query, onQueryChange, onSelect, onCreate, selectedGroup}: AccountListProps) {
    const {t} = useSmartTranslation();
    const showPath = Boolean(query.trim());

    return (
        <Card className="h-100 coa-col">
            <Card.Header className="d-flex align-items-center justify-content-between bg-light-subtle py-2">
                <span className="text-uppercase small fw-semibold text-muted">{t('accounts')}</span>
                <span className="d-flex align-items-center gap-2">
                    <span className="text-muted small">{accounts.length}</span>
                    <button type="button" className="btn btn-sm btn-outline-secondary coa-icon-btn" title={t('newAccount')} onClick={onCreate} disabled={!selectedGroup && !showPath}>
                        <Plus size={14} />
                    </button>
                </span>
            </Card.Header>
            <div className="border-bottom p-2 d-flex align-items-center gap-2">
                <div className="position-relative flex-grow-1">
                    <Search size={14} className="position-absolute text-muted" style={{left: 8, top: "50%", transform: "translateY(-50%)"}} />
                    <Form.Control
                        size="sm"
                        type="search"
                        placeholder={t('searchAccountsPlaceholder')}
                        value={query}
                        onChange={(e) => onQueryChange(e.target.value)}
                        style={{paddingLeft: 28}}
                    />
                </div>
                {showPath && (
                    <button type="button" className="btn btn-sm btn-link text-muted p-0" onClick={() => onQueryChange("")} title={t('clearSearch')}>
                        <X size={16} />
                    </button>
                )}
            </div>
            <ListGroup className="coa-list overflow-auto flex-grow-1">
                {accounts.length === 0 && (
                    <div className="text-center text-muted small py-4 px-2">
                        {showPath ? (
                            <>
                                <p className="mb-2">{t('nothingMatchesQuery', {query})}</p>
                                <Button size="sm" variant="outline-secondary" onClick={() => onQueryChange("")}>{t('clearSearch')}</Button>
                            </>
                        ) : (
                            <>
                                <p className="mb-2">{selectedGroup ? t('noAccountsInGroupYet', {name: selectedGroup.name}) : t('pickGroupFirst')}</p>
                                {selectedGroup && (
                                    <Button size="sm" variant="primary" onClick={onCreate}>{t('addFirstAccount')}</Button>
                                )}
                            </>
                        )}
                    </div>
                )}
                {accounts.map(a => {
                    const group = groups.find(g => g.id === a.account_group_id);
                    const cls = group ? classes.find(c => c.id === group.account_class_id) : undefined;
                    const isInactive = a.status !== "active";
                    return (
                        <ListGroup.Item
                            key={a.id}
                            action
                            active={selectedId === a.id}
                            onClick={() => onSelect(a.id)}
                            className={`d-flex gap-2 align-items-baseline${isInactive ? " opacity-75" : ""}`}
                        >
                            <span className="coa-code text-muted">{a.account_code}</span>
                            <span className="min-width-0 flex-grow-1">
                                <span className="d-block text-truncate text-dark">{a.account_name}</span>
                                <span className="d-block fs-8 text-muted">
                                    {showPath && cls && group ? `${cls.name} › ${group.name}` : (a.account_type ? t(getAccountTypeLabel(a.account_type)) : "—")}
                                </span>
                            </span>
                            <span className="d-flex gap-1 flex-shrink-0">
                                {a.is_control_account && <Badge bg="warning" text="dark">{t('control')}</Badge>}
                                {isInactive && <Badge bg="light" text="dark">{t('inactive')}</Badge>}
                                {cls && <Badge bg={cls.normal_balance === "debit" ? "primary" : "secondary"}>{cls.normal_balance === "debit" ? t('debitAbbr') : t('creditAbbr')}</Badge>}
                            </span>
                        </ListGroup.Item>
                    );
                })}
            </ListGroup>
        </Card>
    );
}
