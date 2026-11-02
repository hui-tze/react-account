import {useMemo} from "react";
import {DocumentNumbering} from "@/apis/models/document-numbering";
import {deleteDocumentNumbering, useGetAllDocumentNumbering, useGetDocumentTypes} from "@/apis/requests/document-numbering-api";
import SettingsListPage from "@/views/Settings/shared/SettingsListPage";
import {StatusBadge} from "@/views/Settings/shared/StatusBadge";
import {useSmartTranslation} from "@/hooks/use-translation";

export const DOCUMENT_NUMBERING_PATH = "/settings/organization/document-numbering";

export function useDocumentTypeLabel() {
    const {data, isLoading} = useGetDocumentTypes();

    return useMemo(() => {
        const byValue = new Map((data ?? []).map(o => [o.value, o.label]));
        return {
            options: data ?? [],
            labelOf: (value: string) => byValue.get(value) ?? value,
            isLoading,
        };
    }, [data, isLoading]);
}

export default function DocumentNumberings() {
    const {t} = useSmartTranslation();
    const {labelOf, isLoading} = useDocumentTypeLabel();

    return (
        <SettingsListPage<DocumentNumbering>
            useFetcher={useGetAllDocumentNumbering}
            editPath={(row) => `${DOCUMENT_NUMBERING_PATH}/${row.id}`}
            onDelete={(row) => deleteDocumentNumbering(row.id)}
            deleteText={(row) => t('recordDeactivateNamed', {name: labelOf(row.document_type)})}
            tableKey={isLoading ? "loading" : "ready"}
            columns={[
                {
                    accessor: "document_type",
                    title: t('documentType'),
                    render: (row) => <span className="fw-semibold text-dark">{labelOf(row.document_type)}</span>,
                },
                {
                    accessor: "pattern",
                    title: t('pattern'),
                    render: (row) => <code>{row.pattern}</code>,
                },
                {
                    accessor: "reset_period",
                    title: t('resetPeriod'),
                    render: (row) => t(`resetPeriod_${row.reset_period}`),
                },
                {
                    accessor: "status",
                    title: t('status'),
                    render: (row) => <StatusBadge status={row.status} />,
                },
            ]}
        />
    );
}
