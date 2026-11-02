import {Button, Card, ListGroup} from "react-bootstrap";
import {Plus} from "react-feather";
import {AccountGroup} from "@/apis/models/account-group";
import {Account} from "@/apis/models/account";
import {AccountClass} from "@/apis/models/account-class";
import {useSmartTranslation} from "@/hooks/use-translation";

export type GroupListProps = {
    groups: AccountGroup[],
    accounts: Account[],
    selectedId: number | null,
    selectedClass: AccountClass | null,
    onSelect: (id: number) => void,
    onCreate: () => void,
}

export default function GroupList({groups, accounts, selectedId, selectedClass, onSelect, onCreate}: GroupListProps) {
    const {t} = useSmartTranslation();

    return (
        <Card className="h-100 coa-col">
            <Card.Header className="d-flex align-items-center justify-content-between bg-light-subtle py-2">
                <span className="text-uppercase small fw-semibold text-muted">{t('accountGroup')}</span>
                <span className="d-flex align-items-center gap-2">
                    <span className="text-muted small">{groups.length}</span>
                    <button type="button" className="btn btn-sm btn-outline-secondary coa-icon-btn" title={t('newGroup')} onClick={onCreate} disabled={!selectedClass}>
                        <Plus size={14} />
                    </button>
                </span>
            </Card.Header>
            <ListGroup className="coa-list overflow-auto flex-grow-1">
                {groups.length === 0 && (
                    <div className="text-center text-muted small py-4 px-2">
                        <p className="mb-2">{selectedClass ? t('noGroupsInClassYet', {name: selectedClass.name}) : t('pickClassFirst')}</p>
                        {selectedClass && (
                            <Button size="sm" variant="outline-secondary" onClick={onCreate}>{t('addFirstGroup')}</Button>
                        )}
                    </div>
                )}
                {groups.map(g => {
                    const n = accounts.filter(a => a.account_group_id === g.id).length;
                    return (
                        <ListGroup.Item
                            key={g.id}
                            action
                            active={selectedId === g.id}
                            onClick={() => onSelect(g.id)}
                            className="d-flex gap-2 align-items-baseline"
                        >
                            <span className="coa-code text-muted">{g.code}</span>
                            <span className="min-width-0">
                                <span className="d-block text-truncate text-dark">{g.name}</span>
                                <span className="d-block fs-8 text-muted">{t('accountCount', {count: n})}</span>
                            </span>
                        </ListGroup.Item>
                    );
                })}
            </ListGroup>
        </Card>
    );
}
