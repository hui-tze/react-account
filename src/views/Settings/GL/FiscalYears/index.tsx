import {Badge, Button} from "react-bootstrap";
import {Trash2} from "react-feather";
import {useNavigate} from "react-router-dom";
import SimpleBar from "simplebar-react";
import {AutoGenerateRemoteTable} from "@/components/@hk-data-table/tables";
import {TableFilters} from "@/apis/table";
import {FiscalYear} from "@/apis/models/fiscal-year";
import {deleteFiscalYear, useGetAllFiscalYear} from "@/apis/requests/fiscal-year-api";
import {useConfirmAction} from "@/hooks/use-confirmation-action";
import {useNotification} from "@/hooks/notification";
import {useSmartTranslation} from "@/hooks/use-translation";

const NO_FILTERS: TableFilters = {};

export default function FiscalYears() {
    const navigate = useNavigate();
    const {t, currentLanguage} = useSmartTranslation();
    const {confirmAndExecute} = useConfirmAction();
    const notify = useNotification();

    return (
        <div className="app-body">
            <SimpleBar className="nicescroll-bar">
                <div className="container-fluid">
                    <AutoGenerateRemoteTable
                        key={currentLanguage}
                        useFetcher={useGetAllFiscalYear}
                        params={NO_FILTERS}
                        sort={["begin|desc"]}
                        hover
                        onRowClick={(fiscalYear: FiscalYear) => navigate(`/settings/gl/fiscal-years/${fiscalYear.id}`)}
                        columns={[
                            {
                                accessor: "begin",
                                title: t('beginDate'),
                            },
                            {
                                accessor: "end",
                                title: t('endDate'),
                            },
                            {
                                accessor: "is_closed",
                                title: t('period'),
                                render: (fiscalYear) => (
                                    <Badge bg="light" className={fiscalYear.is_closed ? "badge-soft-secondary" : "badge-soft-success"}>
                                        {fiscalYear.is_closed ? t('closed') : t('open')}
                                    </Badge>
                                ),
                            },
                            {
                                accessor: "status",
                                title: t('status'),
                                render: (fiscalYear) => (
                                    <Badge bg="light" className={fiscalYear.status === "active" ? "badge-soft-primary" : "badge-soft-danger"}>
                                        {fiscalYear.status === "active" ? t('active') : t('inactive')}
                                    </Badge>
                                ),
                            },
                            {
                                accessor: undefined,
                                title: "",
                                tdClasses: "text-end",
                                render: (fiscalYear, _index, mutate) => fiscalYear.status === "active" && (
                                    <Button
                                        variant="flush-danger"
                                        size="sm"
                                        className="btn-icon btn-rounded"
                                        title={t('delete')}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            confirmAndExecute(async () => {
                                                try {
                                                    await deleteFiscalYear(fiscalYear.id);
                                                    notify.success(t('fiscalYearDeleted'));
                                                    await mutate();
                                                } catch (err) {
                                                    notify.error(err);
                                                }
                                            }, {text: t('fiscalYearDeleteText', {begin: fiscalYear.begin, end: fiscalYear.end})});
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                ),
                            },
                        ]}
                    />
                </div>
            </SimpleBar>
        </div>
    );
}
