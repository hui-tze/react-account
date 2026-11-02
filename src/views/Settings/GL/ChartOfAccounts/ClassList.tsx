import {Card, ListGroup} from "react-bootstrap";
import {Plus} from "react-feather";
import {AccountClass} from "@/apis/models/account-class";
import {AccountGroup} from "@/apis/models/account-group";
import {useSmartTranslation} from "@/hooks/use-translation";

export type ClassListProps = {
    classes: AccountClass[],
    groups: AccountGroup[],
    selectedId: number | null,
    onSelect: (id: number) => void,
    onCreate: () => void,
}

export default function ClassList({classes, groups, selectedId, onSelect, onCreate}: ClassListProps) {
    const {t} = useSmartTranslation();

    return (
        <Card className="h-100 coa-col">
            <Card.Header className="d-flex align-items-center justify-content-between bg-light-subtle py-2">
                <span className="text-uppercase small fw-semibold text-muted">{t('class')}</span>
                <span className="d-flex align-items-center gap-2">
                    <span className="text-muted small">{classes.length}</span>
                    <button type="button" className="btn btn-sm btn-outline-secondary coa-icon-btn" title={t('newClass')} onClick={onCreate}>
                        <Plus size={14} />
                    </button>
                </span>
            </Card.Header>
            <ListGroup className="coa-list overflow-auto flex-grow-1">
                {classes.length === 0 && (
                    <div className="text-center text-muted small py-4">{t('noClassesYet')}</div>
                )}
                {classes.map(c => {
                    const n = groups.filter(g => g.account_class_id === c.id).length;
                    return (
                        <ListGroup.Item
                            key={c.id}
                            action
                            active={selectedId === c.id}
                            onClick={() => onSelect(c.id)}
                            className="d-flex gap-2 align-items-baseline"
                        >
                            <span className="coa-code text-muted">{c.code}</span>
                            <span className="min-width-0">
                                <span className="d-block text-truncate text-dark">{c.name}</span>
                                <span className="d-block fs-8 text-muted">{t('groupCount', {count: n})} · {c.normal_balance === "debit" ? t('debitAbbr') : t('creditAbbr')}</span>
                            </span>
                        </ListGroup.Item>
                    );
                })}
            </ListGroup>
        </Card>
    );
}
