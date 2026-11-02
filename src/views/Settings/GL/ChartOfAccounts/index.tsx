import {useEffect, useMemo, useState} from "react";
import {Col, Row, Spinner} from "react-bootstrap";
import SimpleBar from "simplebar-react";
import {useGetAllAccountClass} from "@/apis/requests/account-class-api";
import {useGetAllAccountGroup} from "@/apis/requests/account-group-api";
import {useGetAllAccount} from "@/apis/requests/account-api";
import {AccountClass} from "@/apis/models/account-class";
import {AccountGroup} from "@/apis/models/account-group";
import {Account} from "@/apis/models/account";
import {ConditionalErrorContent} from "@/components/Display/ErrorBoundary";
import ClassList from "./ClassList";
import GroupList from "./GroupList";
import AccountList from "./AccountList";
import Inspector from "./Inspector";
import CodeSpine from "./CodeSpine";
import AccountClassForm from "./AccountClassForm";
import AccountGroupForm from "./AccountGroupForm";
import AccountForm from "./AccountForm";
import {useNewAccountTrigger} from "./NewAccountTrigger";
import {useSmartTranslation} from "@/hooks/use-translation";

export type SelectionKind = "class" | "group" | "account";

export default function ChartOfAccounts() {
    const {t} = useSmartTranslation();
    const {data: classes, error: classError, isLoading: classLoading, mutate: mutateClasses} = useGetAllAccountClass();
    const {data: groups, error: groupError, isLoading: groupLoading, mutate: mutateGroups} = useGetAllAccountGroup();
    const {data: accounts, error: accountError, isLoading: accountLoading, mutate: mutateAccounts} = useGetAllAccount();

    const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
    const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
    const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
    const [kind, setKind] = useState<SelectionKind>("class");
    const [query, setQuery] = useState("");

    const [classDrawer, setClassDrawer] = useState<{show: boolean, editing?: AccountClass}>({show: false});
    const [groupDrawer, setGroupDrawer] = useState<{show: boolean, editing?: AccountGroup, presetClassId?: number}>({show: false});
    const [accountDrawer, setAccountDrawer] = useState<{show: boolean, editing?: Account, presetGroupId?: number}>({show: false});

    const {nonce: newAccountNonce} = useNewAccountTrigger();

    const groupsInClass = useMemo(
        () => (groups ?? []).filter(g => g.account_class_id === selectedClassId),
        [groups, selectedClassId]
    );

    const accountsInGroup = useMemo(
        () => (accounts ?? []).filter(a => a.account_group_id === selectedGroupId),
        [accounts, selectedGroupId]
    );

    const filteredAccounts = useMemo(() => {
        if (!query.trim()) {
            return accountsInGroup;
        }
        const q = query.trim().toLowerCase();
        return (accounts ?? []).filter(a => a.account_code.toLowerCase().includes(q) || a.account_name.toLowerCase().includes(q));
    }, [accounts, accountsInGroup, query]);

    // pick the first class once data has loaded, mirroring the reference design's default selection.
    useEffect(() => {
        if (selectedClassId == null && classes && classes.length > 0) {
            pickClass(classes[0].id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [classes]);

    // "New account" lives in the module header (appOptions) — open the drawer whenever it's clicked.
    useEffect(() => {
        if (newAccountNonce > 0) {
            setAccountDrawer({show: true, presetGroupId: selectedGroupId ?? undefined});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [newAccountNonce]);

    function pickClass(id: number) {
        setSelectedClassId(id);
        setKind("class");
        setQuery("");
        const firstGroup = (groups ?? []).find(g => g.account_class_id === id);
        setSelectedGroupId(firstGroup?.id ?? null);
        const firstAccount = firstGroup ? (accounts ?? []).find(a => a.account_group_id === firstGroup.id) : undefined;
        setSelectedAccountId(firstAccount?.id ?? null);
    }

    function pickGroup(id: number) {
        const group = (groups ?? []).find(g => g.id === id);
        if (!group) return;
        setSelectedClassId(group.account_class_id);
        setSelectedGroupId(id);
        setKind("group");
        setQuery("");
        const firstAccount = (accounts ?? []).find(a => a.account_group_id === id);
        setSelectedAccountId(firstAccount?.id ?? null);
    }

    function pickAccount(id: number) {
        const account = (accounts ?? []).find(a => a.id === id);
        if (!account) return;
        const group = (groups ?? []).find(g => g.id === account.account_group_id);
        if (group) {
            setSelectedClassId(group.account_class_id);
        }
        setSelectedGroupId(account.account_group_id);
        setSelectedAccountId(id);
        setKind("account");
    }

    const selectedClass = (classes ?? []).find(c => c.id === selectedClassId) ?? null;
    const selectedGroup = (groups ?? []).find(g => g.id === selectedGroupId) ?? null;
    const selectedAccount = (accounts ?? []).find(a => a.id === selectedAccountId) ?? null;

    const error = classError ?? groupError ?? accountError;
    const loading = classLoading || groupLoading || accountLoading;

    if (error) {
        return <ConditionalErrorContent error={error} />;
    }

    return (
        <div className="app-body">
            <SimpleBar className="nicescroll-bar">
                <div className="container-fluid">
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" size="sm" className="me-2" /> {t('loadingChartOfAccounts')}
                        </div>
                    ) : (
                        <>
                            <CodeSpine
                                query={query}
                                selectedClass={selectedClass}
                                selectedGroup={kind !== "class" ? selectedGroup : null}
                                selectedAccount={kind === "account" ? selectedAccount : null}
                            />

                            <Row className="g-2 mt-1 align-items-stretch coa-cols">
                                <Col className="coa-col-class">
                                    <ClassList
                                        classes={classes ?? []}
                                        groups={groups ?? []}
                                        selectedId={kind === "class" ? selectedClassId : (query ? null : selectedClassId)}
                                        onSelect={pickClass}
                                        onCreate={() => setClassDrawer({show: true})}
                                    />
                                </Col>
                                <Col className="coa-col-group">
                                    <GroupList
                                        groups={groupsInClass}
                                        accounts={accounts ?? []}
                                        selectedId={kind === "group" ? selectedGroupId : (query ? null : selectedGroupId)}
                                        selectedClass={selectedClass}
                                        onSelect={pickGroup}
                                        onCreate={() => setGroupDrawer({show: true, presetClassId: selectedClassId ?? undefined})}
                                    />
                                </Col>
                                <Col className="coa-col-account">
                                    <AccountList
                                        accounts={filteredAccounts}
                                        groups={groups ?? []}
                                        classes={classes ?? []}
                                        selectedId={selectedAccountId}
                                        query={query}
                                        onQueryChange={setQuery}
                                        onSelect={pickAccount}
                                        onCreate={() => setAccountDrawer({show: true, presetGroupId: selectedGroupId ?? undefined})}
                                        selectedGroup={selectedGroup}
                                    />
                                </Col>
                                <Col className="coa-col-inspector">
                                    <Inspector
                                        kind={kind}
                                        selectedClass={selectedClass}
                                        selectedGroup={selectedGroup}
                                        selectedAccount={selectedAccount}
                                        classes={classes ?? []}
                                        groups={groups ?? []}
                                        accounts={accounts ?? []}
                                        onEditClass={(c) => setClassDrawer({show: true, editing: c})}
                                        onEditGroup={(g) => setGroupDrawer({show: true, editing: g})}
                                        onEditAccount={(a) => setAccountDrawer({show: true, editing: a})}
                                        onDeletedClass={async () => {
                                            await mutateClasses();
                                            await mutateGroups();
                                            setSelectedClassId(null);
                                        }}
                                        onDeletedGroup={async () => {
                                            await mutateGroups();
                                            await mutateAccounts();
                                            if (selectedClassId) pickClass(selectedClassId);
                                        }}
                                        onDeletedAccount={async () => {
                                            await mutateAccounts();
                                            if (selectedGroupId) pickGroup(selectedGroupId);
                                        }}
                                    />
                                </Col>
                            </Row>
                        </>
                    )}
                </div>
            </SimpleBar>

            <AccountClassForm
                show={classDrawer.show}
                editing={classDrawer.editing}
                onHide={() => setClassDrawer({show: false})}
                onSaved={async (record) => {
                    await mutateClasses();
                    setClassDrawer({show: false});
                    pickClass(record.id);
                }}
            />

            <AccountGroupForm
                show={groupDrawer.show}
                editing={groupDrawer.editing}
                presetClassId={groupDrawer.presetClassId}
                classes={classes ?? []}
                groups={groups ?? []}
                onHide={() => setGroupDrawer({show: false})}
                onSaved={async (record) => {
                    await mutateGroups();
                    setGroupDrawer({show: false});
                    pickGroup(record.id);
                }}
            />

            <AccountForm
                show={accountDrawer.show}
                editing={accountDrawer.editing}
                presetGroupId={accountDrawer.presetGroupId}
                classes={classes ?? []}
                groups={groups ?? []}
                onHide={() => setAccountDrawer({show: false})}
                onSaved={async (record) => {
                    await mutateAccounts();
                    setAccountDrawer({show: false});
                    pickAccount(record.id);
                }}
            />
        </div>
    );
}
