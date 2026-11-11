import type {PropsWithChildren, ReactNode} from "react";
import {formatDate, isIsoDate} from "@/utils/display-format";
import React, {useState} from "react";
import useSortableData from "./hooks/useSortableData";
import classNames from "classnames";
import {Form, Table} from "react-bootstrap";
import {ChevronRight} from "react-feather";
import {ArrowsSort, SortAscending, SortDescending} from "tabler-icons-react";
import useRowSelect from "./hooks/useRowSelect";
import {KeyedMutator} from "swr";
import {isPaginatedData} from "./tables";
import {type PaginationResponse} from "@/apis/pagination";
import {useSmartTranslation} from '@/hooks/use-translation';

export type TDataWithId = { [key: string]: any };

export type ColumnProps<TData> = {
    title: string|ReactNode;
    accessor: string | undefined;
    sort?: boolean;
    hidden?: boolean;
    width?: number|string;
    render?: (record: TData, index: number, mutator: KeyedMutator<PaginationResponse<TData>>) => ReactNode;
    className?: string;
    tdClasses?: string;
    rowSpan?: number;
};

type CustomProps<TData> = {
    mutator: KeyedMutator<PaginationResponse<TData>>,
    idAccessor?: string,
    onRowClick?: (value: TData) => void,
    // extra class per row, e.g. to highlight summary rows
    rowClassName?: (row: TData) => string | undefined,
    // rows that don't open anything (no pointer, no chevron); all clickable by default
    canClickRow?: (row: TData) => boolean,
}

export type HkDataTableProps<TData> = {
    column: ColumnProps<TData>[];
    rowData: TData[];
    bsPrefix?: string;
    classes: string;
    striped?: boolean;
    bordered?: boolean;
    borderless?: boolean;
    hover?: boolean;
    size?: string;
    variant?: string;
    responsive?: boolean;
    rowsPerPage?: number;
    paginatorSize?: "sm" | "lg" | "md";
    rowSelection?: boolean;
    searchBar?: boolean;
    searchQuery?: string;
    searchClasses?: string;
    markStarred?: boolean;
} & CustomProps<TData>;

export default function HkDataTable<TData extends { [key: string]: any }>({
    column,
    rowData,
    bsPrefix,
    classes,
    striped,
    bordered,
    borderless,
    hover,
    size,
    variant,
    responsive,
    rowsPerPage,
    paginatorSize,
    rowSelection,
    searchBar,
    searchQuery,
    searchClasses,
    markStarred,
    mutator,
    idAccessor,
    onRowClick,
    rowClassName,
    canClickRow,
    ...rest
}: PropsWithChildren<HkDataTableProps<TData>>) {
    const {t, currentLanguage} = useSmartTranslation();
    const isPaginated = isPaginatedData(rowData);
    const [data, setData] = useState<TData[]>(isPaginated ? rowData.data : rowData);
    
    // custom hooks for data table
    const { items, requestSort, sortConfig } = useSortableData(data);
    const { selectAll, handleRowSelection, handleSelectAll, isRowSelected } = useRowSelect({
        slice: items.map((item, index) => ({ ...item, id: item.id !== undefined ? item.id : (item[idAccessor ? idAccessor : index]) })),  // Add `id` field dynamically
        data: data.map((item, index) => ({ ...item, id: item.id !== undefined ? item.id : (item[idAccessor ? idAccessor : index]) })),
        idAcessor: idAccessor
    });
    // Local favorite not working well with server side pagination state refresh
    // const { handleStared, favData } = useStarred(data.map((item, index) => ({ ...item, id: item.id !== undefined ? item.id : (item[idAccessor ? idAccessor : index]) })));

    React.useEffect(() => {
        setData(rowData);
    }, [rowData]);

    // Add Favorites
    // React.useEffect(() => {
    //     setData(favData)
    // }, [favData]);

    return (
        <>
            <Table
                bsPrefix={bsPrefix}
                className={classNames("hk-data-table", classes)}
                striped={striped}
                bordered={bordered}
                borderless={borderless}
                hover={hover}
                size={size}
                variant={variant}
                responsive={responsive}
                {...rest}
            >
                <thead>
                    <tr>
                        {(rowSelection || markStarred) && <th>
                            {rowSelection ? <Form.Check
                                type="checkbox"
                                className="fs-6 mb-0"
                                checked={selectAll}
                                onChange={handleSelectAll}
                            />
                                :
                                <></>
                            }

                        </th>}
                        {column.map((cols, index) => {
                            return (
                                <th
                                    key={index}
                                    onClick={() => requestSort(cols.sort ?? false, cols.accessor ?? '')}
                                    className={classNames({ 'd-none': cols.hidden }, { "text-primary": sortConfig !== null && sortConfig.key === cols.accessor }, cols.className)}
                                    rowSpan={cols.rowSpan}
                                    style={{ width: cols.width }}
                                >
                                    <span className="d-flex">
                                        <span className="flex-grow-1">
                                            {cols.title}
                                        </span>
                                        {
                                            cols.sort &&
                                            <span>
                                                {(sortConfig !== null && cols.accessor === sortConfig.key)
                                                    ?
                                                    <>
                                                        {
                                                            (sortConfig.direction === 'ascending')
                                                                ?
                                                                <span style={{ color: '#007D88' }}>
                                                                    <SortAscending size={14} strokeWidth={2.5} />
                                                                </span>
                                                                :
                                                                <span style={{ color: '#007D88' }}>
                                                                    <SortDescending size={14} strokeWidth={2.5} />
                                                                </span>
                                                        }
                                                    </>
                                                    :
                                                    <span><ArrowsSort size={14} strokeWidth={2.5} /> </span>}
                                            </span>
                                        }
                                    </span>
                                </th>
                            );
                        })}
                        {(onRowClick) && <th></th>}
                    </tr>
                </thead>
                <tbody>
                    {
                        items.length === 0
                        ?
                            <tr><td colSpan={column.length + 1} className='text-center'>{t('no_records')}</td></tr>
                        :
                            items.map((row, index) => {
                                const rowKey = idAccessor ? row[idAccessor] : index;
                                const clickable = !!onRowClick && (canClickRow?.(row) ?? true);
                                return (
                                    <tr key={index} className={classNames({ "selected": isRowSelected(rowKey) }, rowClassName?.(row))}
                                        onClick={(event) => {
                                            if (onRowClick && clickable) {
                                                onRowClick(row); // Pass the data (TData) here
                                            }
                                        }}
                                    >
                                        {(rowSelection || markStarred) && <td>
                                            <div className="d-flex align-items-center">
                                                {rowSelection && <Form.Check
                                                    type="checkbox"
                                                    className="form-check fs-6 mb-0"
                                                    checked={isRowSelected(rowKey)}
                                                    onChange={() => handleRowSelection(rowKey)}
                                                />}
                                                {/*{markStarred && <span className={classNames("fav-star", { "marked": row.starred })} onClick={() => handleStared(index)} >*/}
                                                {/*    <span className="feather-icon">*/}
                                                {/*        <Star />*/}
                                                {/*    </span>*/}
                                                {/*</span>}*/}
                                            </div>
                                        </td>}
                                        {column.map((cols, indx) => {
                                            return (
                                                <td
                                                    key={indx}
                                                    className={classNames({ 'd-none': cols.hidden }, cols.tdClasses)}
                                                    style={{ 
                                                        cursor: clickable ? 'pointer' : 'default',
                                                        width: cols.width,
                                                        maxWidth: cols.width,
                                                        overflow: "hidden",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            display: "block",
                                                            width: "100%",
                                                            overflow: "hidden",
                                                            whiteSpace: "nowrap",
                                                            textOverflow: "ellipsis",
                                                        }}
                                                    >
                                                        {cols.render ? (
                                                            cols.render(row, indx, mutator) // Call render function if it exists
                                                        ) : (
                                                            // plain YYYY-MM-DD values show in the Display Preference date format
                                                            cols.accessor !== undefined ? (isIsoDate(row[cols.accessor]) ? formatDate(row[cols.accessor] as string) : row[cols.accessor]) : ''
                                                        )}
                                                    </div>
                                                </td>
                                            );
                                        })}

                                        {(onRowClick) && !clickable && <td />}
                                        {(onRowClick) && clickable &&
                                            <td className="text-end">
                                                <span className="btn-icon btn-rounded flush-soft-hover">
                                                    <span className="icon">
                                                        <span className="feather-icon">
                                                            <ChevronRight />
                                                        </span>
                                                    </span>
                                                </span>
                                            </td>
                                        }
                                    </tr>
                                )
                            })
                    }
                </tbody>
            </Table >
        </>
    )
}

