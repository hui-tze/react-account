import {deleteSalesGroup, updateSalesGroup, useGetOneSalesGroup} from "@/apis/requests/sales-group-api";
import SettingsEditPage from "@/views/Settings/shared/SettingsEditPage";
import {useSmartTranslation} from "@/hooks/use-translation";
import {SalesGroupForm} from "../SalesGroupForm";
import {SALES_GROUPS_PATH} from "../index";

export default function EditSalesGroup() {
    const {t} = useSmartTranslation();

    return (
        <SettingsEditPage
            useGetOne={useGetOneSalesGroup}
            update={updateSalesGroup}
            remove={deleteSalesGroup}
            backTo={SALES_GROUPS_PATH}
            deleteText={(record) => t('recordDeactivateNamed', {name: record.name})}
            renderForm={(props) => <SalesGroupForm {...props} />}
        />
    );
}
