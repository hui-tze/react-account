import {useEffect, useMemo, useState} from "react";
import {formatDate} from "@/utils/display-format";
import {Badge, Button, Card, Col, Dropdown, Form, Row, Table} from "react-bootstrap";
import {BarChart2, Copy, MoreVertical, Plus, Trash2} from "react-feather";
import {useNavigate, useParams} from "react-router-dom";
import {Link} from "@/components/Access/Guarded";
import SimpleBar from "simplebar-react";
import Select, {StylesConfig} from "react-select";
import moment from "moment";
import {Controller, useFieldArray, useWatch} from "react-hook-form";
import type {BudgetDetail, BudgetRow} from "@/apis/models/dimension";
import {BudgetRequest, dimensionApi} from "@/apis/requests/dimension-api";
import {useGetFiscalYearOptions} from "@/apis/requests/fiscal-year-api";
import {useGetAllAccount} from "@/apis/requests/account-api";
import {SelectField, TextAreaField, TextField} from "@/components/FormField/FormFields";
import {ConditionalError} from "@/components/Display/ErrorBoundary";
import {useRequestForm} from "@/hooks/use-request-handler";
import {useNotification} from "@/hooks/notification";
import {useSmartTranslation} from "@/hooks/use-translation";
import SettingsFormPage from "@/views/Settings/shared/SettingsFormPage";
import {applyServerErrors} from "@/views/Inventory/shared/document";
import {money} from "@/views/GeneralLedger/shared/report-ui";
import {reactSelectCustomStyles} from "@/utils/ReactSelect";
import {DimensionValueSelect, useActiveDimensions} from "../shared/DimensionFields";
import {BUDGETS_PATH, budgetPath, budgetReportPath} from "../dimensions-menu";

const Loading = () => <div className="loader-pendulums my-5" />;

const fiscalYearLabel = (begin: string, end: string) => `${formatDate(begin)} – ${formatDate(end)}`;
const round2 = (n: number) => Math.round(n * 100) / 100;
const sum = (values: (number | null | undefined)[]) => round2(values.reduce<number>((s, v) => s + (Number(v) || 0), 0));

/** Budgets of the company, newest fiscal year first. */
export function BudgetList() {
    const {t} = useSmartTranslation();
    const navigate = useNavigate();
    const [fiscalYearId, setFiscalYearId] = useState<number | null>(null);
    const {data: years} = useGetFiscalYearOptions();
    const {data, error} = dimensionApi.useBudgets(fiscalYearId);

    if (error) {
        return <ConditionalError error={error} />;
    }

    return (
        <div className="app-body">
            <SimpleBar className="nicescroll-bar">
                <div className="container-fluid py-3">
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                        <Form.Select value={fiscalYearId ?? ""} onChange={(e) => setFiscalYearId(e.target.value ? Number(e.target.value) : null)} style={{maxWidth: 300}}
                            aria-label={t('fiscalYear')}>
                            <option value="">{t('allFiscalYears')}</option>
                            {(years ?? []).map(y => <option key={y.id} value={y.id}>{fiscalYearLabel(y.begin, y.end)}</option>)}
                        </Form.Select>
                        <Link to={`${BUDGETS_PATH}/create`} className="btn btn-primary btn-sm ms-auto"><Plus size={14} className="me-1" />{t('newBudget')}</Link>
                    </div>
                    <Card className="card-border">
                        {!data ? <Loading /> : data.length === 0 ? (
                            <Card.Body className="text-center text-muted py-5">
                                <p className="mb-1">{t('noBudgetsYet')}</p>
                                <p className="small">{t('noBudgetsHint')}</p>
                                <Link to={`${BUDGETS_PATH}/create`} className="btn btn-outline-primary btn-sm"><Plus size={14} className="me-1" />{t('newBudget')}</Link>
                            </Card.Body>
                        ) : (
                            <div className="table-responsive">
                                <Table hover className="mb-0 align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>{t('name')}</th>
                                            <th>{t('fiscalYear')}</th>
                                            <th>{t('budgetSplitBy')}</th>
                                            <th className="text-end">{t('accounts')}</th>
                                            <th className="text-end">{t('budgetTotal')}</th>
                                            <th>{t('status')}</th>
                                            <th />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.map(b => (
                                            <tr key={b.id} role="button" onClick={() => navigate(budgetPath(b.id))}>
                                                <td className="fw-semibold">{b.name}</td>
                                                <td>{fiscalYearLabel(b.fiscal_year_begin, b.fiscal_year_end)}</td>
                                                <td>{b.dimension_name ?? <span className="text-muted">{t('wholeCompany')}</span>}</td>
                                                <td className="text-end">{b.account_count ?? 0}</td>
                                                <td className="text-end">{money(b.total ?? 0, false)}</td>
                                                <td><Badge bg="light" className={b.status === "active" ? "badge-soft-success" : "badge-soft-secondary"}>{t(b.status === "active" ? 'active' : 'inactive')}</Badge></td>
                                                <td className="text-end" onClick={(e) => e.stopPropagation()}>
                                                    <Link to={budgetReportPath(b.id)} className="btn btn-sm btn-flush-dark" title={t('menu_BudgetVsActual')}><BarChart2 size={15} /></Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </Card>
                </div>
            </SimpleBar>
        </div>
    );
}

type AccountOption = {value: number, label: string};
const accountSelectStyles = {
    ...reactSelectCustomStyles,
    control: (base: object, state: object) => ({...((reactSelectCustomStyles.control as (b: object, s: object) => object)?.(base, state) ?? base), minHeight: 32, minWidth: 220}),
    menuPortal: (base: object) => ({...base, zIndex: 1060}),
} as StylesConfig<AccountOption, false>;

/** Spread an annual amount over the months, the rounding remainder on the last month. */
function spread(total: number, months: number): number[] {
    const each = Math.floor(total / months * 100) / 100;
    const amounts = Array(months).fill(each);
    amounts[months - 1] = round2(total - each * (months - 1));
    return amounts;
}

function BudgetForm({record}: {record?: BudgetDetail}) {
    const {t} = useSmartTranslation();
    const navigate = useNavigate();
    const notify = useNotification();
    const {data: years} = useGetFiscalYearOptions();
    const {data: accounts} = useGetAllAccount();
    const {dimensions} = useActiveDimensions();

    const {control, setValue, getValues, setError, submitting, handleSubmitRequest} = useRequestForm<BudgetRequest>({
        formOptions: {
            defaultValues: {
                fiscal_year_id: record?.fiscal_year_id ?? null,
                name: record?.name ?? "",
                dimension_id: record?.dimension_id ?? null,
                notes: record?.notes ?? "",
                status: record?.status ?? "active",
                rows: record?.rows ?? [],
            },
        },
    });
    const {fields, append, remove} = useFieldArray({control, name: "rows"});
    const [fiscalYearId, dimensionId, rows] = useWatch({control, name: ["fiscal_year_id", "dimension_id", "rows"]});
    const {data: loadedMonths} = dimensionApi.useBudgetMonths(fiscalYearId);
    const months = useMemo(() => loadedMonths ?? record?.months ?? [], [loadedMonths, record]);
    const dimension = dimensions.find(d => d.id === dimensionId);

    // another fiscal year may have a different number of months: keep each row's amounts in step
    useEffect(() => {
        if (!months.length) {
            return;
        }
        (getValues("rows") ?? []).forEach((row, i) => {
            if (row.amounts.length !== months.length) {
                setValue(`rows.${i}.amounts`, Array.from({length: months.length}, (_, m) => row.amounts[m] ?? null));
            }
        });
    }, [months, getValues, setValue]);

    const accountOptions: AccountOption[] = (accounts ?? [])
        .filter(a => (a.status === "active" && a.allow_transaction) || rows?.some(r => r.account_id === a.id))
        .map(a => ({value: a.id, label: `${a.account_code} · ${a.account_name}`}));

    const blankRow = (): BudgetRow => ({account_id: null, dimension_value_id: null, amounts: Array(months.length).fill(null)});

    const spreadRow = (index: number) => {
        const current = sum(getValues(`rows.${index}.amounts`));
        const input = window.prompt(t('budgetSpreadPrompt'), current ? String(current) : "");
        const total = Number(input);
        if (input !== null && !Number.isNaN(total)) {
            setValue(`rows.${index}.amounts`, spread(total, months.length), {shouldDirty: true});
        }
    };
    const fillRight = (index: number) => {
        const first = Number(getValues(`rows.${index}.amounts.0`)) || 0;
        setValue(`rows.${index}.amounts`, Array(months.length).fill(first), {shouldDirty: true});
    };

    const submit = async (values: BudgetRequest) => {
        const data: BudgetRequest = {
            ...values,
            notes: values.notes || null,
            rows: values.rows.map(r => ({...r, dimension_value_id: values.dimension_id ? r.dimension_value_id : null,
                amounts: r.amounts.map(a => (a === null || (a as unknown) === "" ? 0 : Number(a)))})),
        };
        try {
            return record ? await dimensionApi.editBudget(record.id, data) : await dimensionApi.addBudget(data);
        } catch (e) {
            applyServerErrors(e, setError, ["fiscal_year_id", "name", "dimension_id", "rows"]);
            throw e;
        }
    };

    const remove_ = async () => {
        if (!record || !window.confirm(t('budgetDeleteConfirm', {name: record.name}))) {
            return;
        }
        try {
            await dimensionApi.deleteBudget(record.id);
            navigate(BUDGETS_PATH);
        } catch (e) {
            notify.error(e);
        }
    };

    const monthTotals = months.map((_, m) => sum((rows ?? []).map(r => r.amounts?.[m])));
    const grandTotal = sum(monthTotals);

    return (
        <SettingsFormPage
            onSubmit={handleSubmitRequest({request: submit, onSuccess: async (saved) => navigate(budgetPath(saved.id), {replace: true})})}
            submitting={submitting}
            isEditing={!!record}
            backTo={BUDGETS_PATH}
            onDelete={record ? remove_ : undefined}
            stickyActions
            actionsSummary={<><span className="small">{t('budgetTotal')}</span><span className="fs-5 fw-bold text-dark">{money(grandTotal, false)}</span></>}
        >
            <Card className="card-border mb-3">
                <Card.Body>
                    <Row className="gx-4">
                        <Col md={4}>
                            <TextField control={control} name="name" label={t('budgetName')} required maxLength={255} placeholder={t('budgetNamePlaceholder')} />
                        </Col>
                        <Col md={4}>
                            <SelectField control={control} name="fiscal_year_id" label={t('fiscalYear')} required numeric placeholder=""
                                options={(years ?? []).map(y => ({value: y.id, label: fiscalYearLabel(y.begin, y.end)}))} />
                        </Col>
                        <Col md={4}>
                            <SelectField control={control} name="dimension_id" label={t('budgetSplitBy')} numeric placeholder={t('wholeCompany')}
                                options={dimensions.map(d => ({value: d.id, label: d.name}))} hint={t('budgetSplitByHint')} />
                        </Col>
                        <Col xs={12}>
                            <TextAreaField control={control} name="notes" label={t('notes')} rows={2} />
                        </Col>
                    </Row>
                    {record && (
                        <Link to={budgetReportPath(record.id)} className="small"><BarChart2 size={13} className="me-1" />{t('viewBudgetVsActual')}</Link>
                    )}
                </Card.Body>
            </Card>

            <Card className="card-border">
                <Card.Header className="d-flex flex-wrap align-items-center gap-2">
                    <span className="fw-semibold">{t('budgetLines')}</span>
                    <span className="small text-muted">{t('budgetLinesHint')}</span>
                </Card.Header>
                {!fiscalYearId || !months.length ? (
                    <Card.Body className="text-center text-muted py-4">{t('pickFiscalYearFirst')}</Card.Body>
                ) : (
                    <>
                        <div className="table-responsive budget-grid">
                            <Table size="sm" className="mb-0 align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th className="budget-grid-sticky" style={{minWidth: 240}}>{t('account')}</th>
                                        {dimension && <th style={{minWidth: 170}}>{dimension.name}</th>}
                                        {months.map(m => <th key={m} className="text-end" style={{minWidth: 96}}>{moment(m, "YYYY-MM").format("MMM YY")}</th>)}
                                        <th className="text-end" style={{minWidth: 110}}>{t('total')}</th>
                                        <th style={{width: 40}} />
                                    </tr>
                                </thead>
                                <tbody>
                                    {fields.length === 0 && (
                                        <tr><td colSpan={months.length + (dimension ? 4 : 3)} className="text-center text-muted py-4">{t('budgetNoLines')}</td></tr>
                                    )}
                                    {fields.map((field, index) => (
                                        <tr key={field.id}>
                                            <td className="budget-grid-sticky">
                                                <Controller control={control} name={`rows.${index}.account_id`} rules={{required: true}}
                                                    render={({field: f, fieldState}) => (
                                                        <Select<AccountOption, false> options={accountOptions} value={accountOptions.find(o => o.value === f.value) ?? null}
                                                            onChange={(o) => f.onChange(o?.value ?? null)} placeholder={t('pickAccount')}
                                                            styles={{...accountSelectStyles, control: (b, s) => ({...(accountSelectStyles.control?.(b, s) ?? b), ...(fieldState.error ? {borderColor: "#dc3545"} : {})})}}
                                                            menuPortalTarget={document.body} classNamePrefix="select" />
                                                    )} />
                                            </td>
                                            {dimension && (
                                                <td>
                                                    <Controller control={control} name={`rows.${index}.dimension_value_id`} rules={{required: true}}
                                                        render={({field: f, fieldState}) => (
                                                            <DimensionValueSelect dimension={dimension} value={f.value} onChange={f.onChange} compact anyValue invalid={!!fieldState.error} />
                                                        )} />
                                                </td>
                                            )}
                                            {months.map((m, mi) => (
                                                <td key={m}>
                                                    <Controller control={control} name={`rows.${index}.amounts.${mi}`}
                                                        render={({field: f}) => (
                                                            <Form.Control size="sm" type="number" step="0.01" className="text-end" value={f.value ?? ""}
                                                                onChange={(e) => f.onChange(e.target.value === "" ? null : Number(e.target.value))} onBlur={f.onBlur} />
                                                        )} />
                                                </td>
                                            ))}
                                            <td className="text-end fw-semibold">{money(sum(rows?.[index]?.amounts ?? []), false)}</td>
                                            <td>
                                                <Dropdown align="end">
                                                    <Dropdown.Toggle variant="flush-dark" size="sm" className="btn-icon no-caret"><MoreVertical size={15} /></Dropdown.Toggle>
                                                    <Dropdown.Menu>
                                                        <Dropdown.Item onClick={() => spreadRow(index)}>{t('budgetSpread')}</Dropdown.Item>
                                                        <Dropdown.Item onClick={() => fillRight(index)}><Copy size={13} className="me-2" />{t('budgetFillFromFirst')}</Dropdown.Item>
                                                        <Dropdown.Item onClick={() => append({...rows[index], amounts: [...rows[index].amounts], dimension_value_id: null})}>{t('budgetDuplicateRow')}</Dropdown.Item>
                                                        <Dropdown.Divider />
                                                        <Dropdown.Item className="text-danger" onClick={() => remove(index)}><Trash2 size={13} className="me-2" />{t('remove')}</Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                {fields.length > 0 && (
                                    <tfoot>
                                        <tr className="fw-semibold">
                                            <td className="budget-grid-sticky">{t('total')}</td>
                                            {dimension && <td />}
                                            {monthTotals.map((total, m) => <td key={months[m]} className="text-end">{money(total)}</td>)}
                                            <td className="text-end">{money(grandTotal, false)}</td>
                                            <td />
                                        </tr>
                                    </tfoot>
                                )}
                            </Table>
                        </div>
                        <Card.Footer className="bg-transparent">
                            <Button variant="outline-primary" size="sm" onClick={() => append(blankRow())}><Plus size={14} className="me-1" />{t('addBudgetLine')}</Button>
                            <span className="small text-muted ms-3">{t('budgetAmountsHint')}</span>
                        </Card.Footer>
                    </>
                )}
            </Card>
        </SettingsFormPage>
    );
}

export function CreateBudget() {
    return <BudgetForm />;
}

export function EditBudget() {
    const {id} = useParams();
    const {data, error} = dimensionApi.useBudget(id);
    if (error) {
        return <ConditionalError error={error} />;
    }
    return data ? <BudgetForm key={data.id} record={data} /> : <Loading />;
}
