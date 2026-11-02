import {deleteSalesType, updateSalesType, useGetOneSalesType} from "@/apis/requests/sales-type-api";
import SettingsEditPage from "@/views/Settings/shared/SettingsEditPage";
import {useSmartTranslation} from "@/hooks/use-translation";
import {SalesTypeForm} from "../SalesTypeForm";
import {SALES_TYPES_PATH} from "../index";

export default function EditSalesType() {
    const {t} = useSmartTranslation();

    return (
        <SettingsEditPage
            useGetOne={useGetOneSalesType}
            update={updateSalesType}
            remove={deleteSalesType}
            backTo={SALES_TYPES_PATH}
            deleteText={(record) => t('recordDeactivateNamed', {name: record.name})}
            renderForm={(props) => <SalesTypeForm {...props} />}
        />
    );
}
