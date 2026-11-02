import {Badge, Button} from "react-bootstrap";
import {Trash2} from "react-feather";
import {useNavigate} from "react-router-dom";
import SimpleBar from "simplebar-react";
import {AutoGenerateRemoteTable} from "@/components/@hk-data-table/tables";
import {TableFilters} from "@/apis/table";
import {ExchangeRate} from "@/apis/models/exchange-rate";
import {deleteExchangeRate, useGetAllExchangeRate} from "@/apis/requests/exchange-rate-api";
import {useConfirmAction} from "@/hooks/use-confirmation-action";
import {useNotification} from "@/hooks/notification";
import {useSmartTranslation} from "@/hooks/use-translation";

const NO_FILTERS: TableFilters = {};

export default function ExchangeRates() {
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
                        useFetcher={useGetAllExchangeRate}
                        params={NO_FILTERS}
                        sort={["rate_date|desc"]}
                        hover
                        onRowClick={(exchangeRate: ExchangeRate) => navigate(`/settings/gl/exchange-rates/${exchangeRate.id}`)}
                        columns={[
                            {
                                accessor: "rate_date",
                                title: t('rateDate'),
                            },
                            {
                                accessor: "currency_id",
                                title: t('currency'),
                                render: (exchangeRate) => exchangeRate.currency ? (
                                    <>
                                        <span className="fw-semibold text-dark">{exchangeRate.currency.code}</span>
                                        <span className="text-muted ms-2">{exchangeRate.currency.name}</span>
                                    </>
                                ) : "-",
                            },
                            {
                                accessor: "rate",
                                title: t('rate'),
                                render: (exchangeRate) => <span className="font-monospace">{exchangeRate.rate}</span>,
                            },
                            {
                                accessor: "status",
                                title: t('status'),
                                render: (exchangeRate) => (
                                    <Badge bg="light" className={exchangeRate.status === "active" ? "badge-soft-primary" : "badge-soft-danger"}>
                                        {exchangeRate.status === "active" ? t('active') : t('inactive')}
                                    </Badge>
                                ),
                            },
                            {
                                accessor: undefined,
                                title: "",
                                tdClasses: "text-end",
                                render: (exchangeRate, _index, mutate) => exchangeRate.status === "active" && (
                                    <Button
                                        variant="flush-danger"
                                        size="sm"
                                        className="btn-icon btn-rounded"
                                        title={t('delete')}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            confirmAndExecute(async () => {
                                                try {
                                                    await deleteExchangeRate(exchangeRate.id);
                                                    notify.success(t('exchangeRateDeleted'));
                                                    await mutate();
                                                } catch (err) {
                                                    notify.error(err);
                                                }
                                            }, {text: t('exchangeRateDeleteText', {code: exchangeRate.currency?.code ?? "", date: exchangeRate.rate_date})});
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
