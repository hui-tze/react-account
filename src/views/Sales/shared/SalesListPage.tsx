import {useCallback, useState} from "react";
import {Col, Form, Row} from "react-bootstrap";
import type {SWRResponse} from "swr";
import {PaginationResponse} from "@/apis/pagination";
import {ColumnProps} from "@/components/@hk-data-table";
import {ColumnRecord} from "@/components/@hk-data-table/tables";
import SettingsListPage from "@/views/Settings/shared/SettingsListPage";
import {useSmartTranslation} from "@/hooks/use-translation";
import {SearchBox} from "./SearchBox";

type SalesListPageProps<T extends ColumnRecord & {id: number}> = {
    useGetAll: (params: URLSearchParams) => SWRResponse<PaginationResponse<T>>,
    columns: ColumnProps<T>[],
    editPath: (row: T) => string,
    // states offered in the status filter
    states: string[],
    searchPlaceholder: string,
    tableKey?: string,
    // a party dropdown (e.g. supplier), sent as `param`
    partyFilter?: {param: string, placeholder: string, options: {value: number, label: string}[]},
};

/** Listing of a sales document type with search, status and date filters (sent as q / state / date_from / date_to). */
export function SalesListPage<T extends ColumnRecord & {id: number}>({useGetAll, columns, editPath, states, searchPlaceholder, tableKey, partyFilter}: SalesListPageProps<T>) {
    const {t} = useSmartTranslation();
    const [search, setSearch] = useState("");
    const [state, setState] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [party, setParty] = useState("");
    const partyParam = partyFilter?.param;

    // the table calls this as a hook with its paging params; the filters ride along
    const useFetcher = useCallback((params: URLSearchParams) => {
        const query = new URLSearchParams(params);
        Object.entries({q: search, state, date_from: dateFrom, date_to: dateTo, ...(partyParam ? {[partyParam]: party} : {})}).forEach(([key, value]) => {
            if (value) {
                query.set(key, value);
            }
        });
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useGetAll(query);
    }, [useGetAll, search, state, dateFrom, dateTo, party, partyParam]);

    return (
        <SettingsListPage<T>
            useFetcher={useFetcher}
            editPath={editPath}
            tableKey={tableKey}
            columns={columns}
            toolbar={(
                <Row className="g-2 py-3 align-items-center">
                    <Col md={4}>
                        <SearchBox value={search} onChange={setSearch} placeholder={searchPlaceholder} />
                    </Col>
                    {partyFilter && (
                        <Col md={3}>
                            <Form.Select value={party} onChange={(e) => setParty(e.target.value)} aria-label={partyFilter.placeholder}>
                                <option value="">{partyFilter.placeholder}</option>
                                {partyFilter.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </Form.Select>
                        </Col>
                    )}
                    <Col md="auto">
                        <Form.Select value={state} onChange={(e) => setState(e.target.value)} aria-label={t('status')}>
                            <option value="">{t('allStatuses')}</option>
                            {states.map(s => <option key={s} value={s}>{t(`salesState_${s}`)}</option>)}
                        </Form.Select>
                    </Col>
                    <Col md="auto" className="d-flex align-items-center gap-2">
                        <Form.Control type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} aria-label={t('dateFrom')} />
                        <span className="text-muted">–</span>
                        <Form.Control type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} aria-label={t('dateTo')} />
                    </Col>
                </Row>
            )}
        />
    );
}
