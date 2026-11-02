import {Badge, Button} from "react-bootstrap";
import {Trash2} from "react-feather";
import {useNavigate} from "react-router-dom";
import SimpleBar from "simplebar-react";
import {AutoGenerateRemoteTable} from "@/components/@hk-data-table/tables";
import {TableFilters} from "@/apis/table";
import {Currency} from "@/apis/models/currency";
import {deleteCurrency, useGetAllCurrency} from "@/apis/requests/currency-api";
import {useConfirmAction} from "@/hooks/use-confirmation-action";
import {useNotification} from "@/hooks/notification";
import {useSmartTranslation} from "@/hooks/use-translation";

const NO_FILTERS: TableFilters = {};

export default function Currencies() {
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
                        useFetcher={useGetAllCurrency}
                        params={NO_FILTERS}
                        sort={["code|asc"]}
                        hover
                        onRowClick={(currency: Currency) => navigate(`/settings/gl/currencies/${currency.id}`)}
                        columns={[
                            {
                                accessor: "code",
                                title: t('code'),
                                render: (currency) => <span className="fw-semibold text-dark">{currency.code}</span>,
                            },
                            {
                                accessor: "name",
                                title: t('name'),
                            },
                            {
                                accessor: "symbol",
                                title: t('symbol'),
                            },
                            {
                                accessor: "decimal_places",
                                title: t('decimalPlaces'),
                            },
                            {
                                accessor: "status",
                                title: t('status'),
                                render: (currency) => (
                                    <Badge bg="light" className={currency.status === "active" ? "badge-soft-primary" : "badge-soft-danger"}>
                                        {currency.status === "active" ? t('active') : t('inactive')}
                                    </Badge>
                                ),
                            },
                            {
                                accessor: undefined,
                                title: "",
                                tdClasses: "text-end",
                                render: (currency, _index, mutate) => currency.status === "active" && (
                                    <Button
                                        variant="flush-danger"
                                        size="sm"
                                        className="btn-icon btn-rounded"
                                        title={t('delete')}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            confirmAndExecute(async () => {
                                                try {
                                                    await deleteCurrency(currency.id);
                                                    notify.success(t('currencyDeleted'));
                                                    await mutate();
                                                } catch (err) {
                                                    notify.error(err);
                                                }
                                            }, {text: t('currencyDeleteText', {code: currency.code})});
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
