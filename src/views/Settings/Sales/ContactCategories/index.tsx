import {ContactCategory, CONTACT_ENTITY_TYPES} from "@/apis/models/contact-category";
import {deleteContactCategory, useGetAllContactCategory} from "@/apis/requests/contact-category-api";
import {SelectOption} from "@/components/FormField/FormFields";
import SettingsListPage from "@/views/Settings/shared/SettingsListPage";
import {StatusBadge, YesNoBadge} from "@/views/Settings/shared/StatusBadge";
import {useSmartTranslation} from "@/hooks/use-translation";

export const CONTACT_CATEGORIES_PATH = "/sales/setup/contact-categories";

// translation keys for App\Domain\Constants\ContactEntityType
export const CONTACT_ENTITY_TYPE_LABEL_KEYS: Record<string, string> = {
    company: "company",
    customer: "customer",
    supplier: "supplier",
    employee: "employee",
    bank: "bank",
    other: "other",
};

export function useContactEntityTypeOptions(): SelectOption[] {
    const {t} = useSmartTranslation();
    return CONTACT_ENTITY_TYPES.map(value => ({value, label: t(CONTACT_ENTITY_TYPE_LABEL_KEYS[value])}));
}

export default function ContactCategories() {
    const {t} = useSmartTranslation();

    return (
        <SettingsListPage<ContactCategory>
            useFetcher={useGetAllContactCategory}
            editPath={(row) => `${CONTACT_CATEGORIES_PATH}/${row.id}`}
            onDelete={(row) => deleteContactCategory(row.id)}
            canDelete={(row) => !row.is_system}
            deleteText={(row) => t('recordDeactivateNamed', {name: row.name})}
            columns={[
                {
                    accessor: "code",
                    title: t('code'),
                    render: (row) => <span className="fw-semibold text-dark">{row.code}</span>,
                },
                {
                    accessor: "name",
                    title: t('name'),
                },
                {
                    accessor: "entity_type",
                    title: t('entityType'),
                    render: (row) => {
                        const key = CONTACT_ENTITY_TYPE_LABEL_KEYS[row.entity_type];
                        return key ? t(key) : row.entity_type;
                    },
                },
                {
                    accessor: "is_system",
                    title: t('systemDefined'),
                    render: (row) => <YesNoBadge value={row.is_system} />,
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
