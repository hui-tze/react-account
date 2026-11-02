import {ReactNode} from "react";
import {Badge, Button} from "react-bootstrap";
import {AccountClass} from "@/apis/models/account-class";
import {AccountGroup} from "@/apis/models/account-group";
import {Account} from "@/apis/models/account";
import {SelectionKind} from "./index";
import {useConfirmAction} from "@/hooks/use-confirmation-action";
import {useNotification} from "@/hooks/notification";
import {useSmartTranslation} from "@/hooks/use-translation";
import {deleteAccountClass} from "@/apis/requests/account-class-api";
import {deleteAccountGroup} from "@/apis/requests/account-group-api";
import {deleteAccount} from "@/apis/requests/account-api";
import {getAccountTypeLabel} from "@/constants/AccountType";

export type InspectorProps = {
    kind: SelectionKind,
    selectedClass: AccountClass | null,
    selectedGroup: AccountGroup | null,
    selectedAccount: Account | null,
    classes: AccountClass[],
    groups: AccountGroup[],
    accounts: Account[],
    onEditClass: (c: AccountClass) => void,
    onEditGroup: (g: AccountGroup) => void,
    onEditAccount: (a: Account) => void,
    onDeletedClass: () => Promise<void>,
    onDeletedGroup: () => Promise<void>,
    onDeletedAccount: () => Promise<void>,
}

function Field({label, children}: {label: string, children: ReactNode}) {
    return (
        <div className="d-flex justify-content-between gap-3 py-2 border-bottom coa-field">
            <span className="text-muted small">{label}</span>
            <span className="text-end fs-7 text-dark">{children}</span>
        </div>
    );
}

export default function Inspector({
    kind, selectedClass, selectedGroup, selectedAccount, classes, groups, accounts,
    onEditClass, onEditGroup, onEditAccount, onDeletedClass, onDeletedGroup, onDeletedAccount,
}: InspectorProps) {
    const {confirmAndExecute} = useConfirmAction();
    const notify = useNotification();
    const {t} = useSmartTranslation();

    if (kind === "class") {
        if (!selectedClass) {
            return <EmptyInspector />;
        }
        const groupCount = groups.filter(g => g.account_class_id === selectedClass.id).length;

        return (
            <div className="h-100 coa-col d-flex flex-column border rounded bg-white">
                <div className="p-3 border-bottom">
                    <div className="text-uppercase small text-muted">{t('chartClass')}</div>
                    <div className="coa-code fs-5 fw-semibold text-dark">{selectedClass.code}</div>
                    <div className="fw-semibold text-dark">{selectedClass.name}</div>
                    <div className="d-flex gap-1 flex-wrap mt-2">
                        <Badge bg={selectedClass.normal_balance === "debit" ? "primary" : "secondary"}>
                            {t('normalBalance')} {selectedClass.normal_balance === "debit" ? t('debitAbbr') : t('creditAbbr')}
                        </Badge>
                        <Badge bg="light" text="dark">{selectedClass.financial_statement === "balance_sheet" ? t('balanceSheet') : t('profitOrLoss')}</Badge>
                        {selectedClass.status !== "active" && <Badge bg="light" text="dark">{t('inactive')}</Badge>}
                    </div>
                </div>
                <div className="p-3 flex-grow-1 overflow-auto">
                    <Field label={t('accountGroup')}>{groupCount}</Field>
                    <Field label={t('sequence')}>{selectedClass.sequence}</Field>
                    <Field label={t('reportsOn')}>{selectedClass.financial_statement === "balance_sheet" ? t('balanceSheet') : t('profitOrLoss')}</Field>
                </div>
                <div className="p-3 border-top d-flex gap-2">
                    <Button size="sm" variant="outline-secondary" onClick={() => onEditClass(selectedClass)}>{t('editClass')}</Button>
                    <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => confirmAndExecute(async () => {
                            try {
                                await deleteAccountClass(selectedClass.id);
                                notify.success(t('classDeactivated'));
                                await onDeletedClass();
                            } catch (e) {
                                notify.error(e);
                            }
                        }, {title: t('confirmDeleteClassTitle', {code: selectedClass.code, name: selectedClass.name}), text: t('deactivateClassText')})}
                    >
                        {t('delete')}
                    </Button>
                </div>
            </div>
        );
    }

    if (kind === "group") {
        if (!selectedGroup) {
            return <EmptyInspector />;
        }
        const cls = classes.find(c => c.id === selectedGroup.account_class_id);
        const accountCount = accounts.filter(a => a.account_group_id === selectedGroup.id).length;

        return (
            <div className="h-100 coa-col d-flex flex-column border rounded bg-white">
                <div className="p-3 border-bottom">
                    <div className="text-uppercase small text-muted">{t('chartGroup')}</div>
                    <div className="coa-code fs-5 fw-semibold text-dark">{selectedGroup.code}</div>
                    <div className="fw-semibold text-dark">{selectedGroup.name}</div>
                    <div className="d-flex gap-1 flex-wrap mt-2">
                        {cls && <Badge bg="light" text="dark">{cls.code} {cls.name}</Badge>}
                        {selectedGroup.status !== "active" && <Badge bg="light" text="dark">{t('inactive')}</Badge>}
                    </div>
                </div>
                <div className="p-3 flex-grow-1 overflow-auto">
                    <Field label={t('class')}>{cls ? `${cls.code} · ${cls.name}` : "—"}</Field>
                    <Field label={t('accounts')}>{accountCount}</Field>
                    <Field label={t('sequence')}>{selectedGroup.sequence}</Field>
                </div>
                <div className="p-3 border-top d-flex gap-2">
                    <Button size="sm" variant="outline-secondary" onClick={() => onEditGroup(selectedGroup)}>{t('editGroup')}</Button>
                    <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => confirmAndExecute(async () => {
                            try {
                                await deleteAccountGroup(selectedGroup.id);
                                notify.success(t('groupDeactivated'));
                                await onDeletedGroup();
                            } catch (e) {
                                notify.error(e);
                            }
                        }, {title: t('confirmDeleteGroupTitle', {code: selectedGroup.code, name: selectedGroup.name}), text: t('deactivateGroupText')})}
                    >
                        {t('delete')}
                    </Button>
                </div>
            </div>
        );
    }

    if (!selectedAccount) {
        return <EmptyInspector />;
    }

    const group = groups.find(g => g.id === selectedAccount.account_group_id);
    const cls = group ? classes.find(c => c.id === group.account_class_id) : undefined;

    return (
        <div className="h-100 coa-col d-flex flex-column border rounded bg-white">
            <div className="p-3 border-bottom">
                <div className="text-uppercase small text-muted">{t('account')}</div>
                <div className="coa-code fs-5 fw-semibold text-dark">{selectedAccount.account_code}</div>
                <div className="fw-semibold text-dark">{selectedAccount.account_name}</div>
                <div className="d-flex gap-1 flex-wrap mt-2">
                    {cls && <Badge bg={cls.normal_balance === "debit" ? "primary" : "secondary"}>{cls.normal_balance === "debit" ? t('debitAbbr') : t('creditAbbr')}</Badge>}
                    {selectedAccount.is_control_account && <Badge bg="warning" text="dark">{t('controlAccount')}</Badge>}
                    <Badge bg="light" text="dark">{selectedAccount.status === "active" ? t('active') : t('inactive')}</Badge>
                </div>
            </div>
            <div className="p-3 flex-grow-1 overflow-auto">
                <Field label={t('class')}>{cls ? `${cls.code} · ${cls.name}` : "—"}</Field>
                <Field label={t('accountGroup')}>{group ? `${group.code} · ${group.name}` : "—"}</Field>
                <Field label={t('accountType')}>{selectedAccount.account_type ? t(getAccountTypeLabel(selectedAccount.account_type)) : "—"}</Field>
                <Field label={t('manualJournals')}>{selectedAccount.allow_transaction ? t('allowed') : t('blocked')}</Field>
                {selectedAccount.is_control_account && (
                    <p className="small text-warning-emphasis bg-warning-subtle rounded p-2 mt-2 mb-0">
                        {t('controlAccountHint')}
                    </p>
                )}
            </div>
            <div className="p-3 border-top d-flex gap-2">
                <Button size="sm" variant="outline-secondary" onClick={() => onEditAccount(selectedAccount)}>{t('editAccount')}</Button>
                <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => confirmAndExecute(async () => {
                        try {
                            await deleteAccount(selectedAccount.id);
                            notify.success(t('accountDeactivated'));
                            await onDeletedAccount();
                        } catch (e) {
                            notify.error(e);
                        }
                    }, {title: t('confirmDeleteAccountTitle', {code: selectedAccount.account_code}), text: t('deactivateAccountText')})}
                >
                    {t('delete')}
                </Button>
            </div>
        </div>
    );
}

function EmptyInspector() {
    const {t} = useSmartTranslation();

    return (
        <div className="h-100 coa-col d-flex align-items-center justify-content-center border rounded bg-white text-muted small text-center p-4">
            {t('emptyInspectorHint')}
        </div>
    );
}
