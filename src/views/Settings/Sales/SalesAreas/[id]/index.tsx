import {deleteSalesArea, updateSalesArea, useGetOneSalesArea} from "@/apis/requests/sales-area-api";
import SettingsEditPage from "@/views/Settings/shared/SettingsEditPage";
import {useSmartTranslation} from "@/hooks/use-translation";
import {SalesAreaForm} from "../SalesAreaForm";
import {SALES_AREAS_PATH} from "../index";

export default function EditSalesArea() {
    const {t} = useSmartTranslation();

    return (
        <SettingsEditPage
            useGetOne={useGetOneSalesArea}
            update={updateSalesArea}
            remove={deleteSalesArea}
            backTo={SALES_AREAS_PATH}
            deleteText={(record) => t('recordDeactivateNamed', {name: record.name})}
            renderForm={(props) => <SalesAreaForm {...props} />}
        />
    );
}
