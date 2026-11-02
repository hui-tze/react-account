import {updateInventoryAdjustment, useGetOneInventoryAdjustment, voidInventoryAdjustment} from "@/apis/requests/inventory-adjustment-api";
import SettingsEditPage from "@/views/Settings/shared/SettingsEditPage";
import {useSmartTranslation} from "@/hooks/use-translation";
import {AdjustmentForm} from "../AdjustmentForm";
import {ADJUSTMENTS_PATH} from "../../inventory-menu";

export default function EditAdjustment() {
    const {t} = useSmartTranslation();

    return (
        <SettingsEditPage
            useGetOne={useGetOneInventoryAdjustment}
            update={updateInventoryAdjustment}
            remove={voidInventoryAdjustment}
            backTo={ADJUSTMENTS_PATH}
            deleteText={(record) => t('documentVoidText', {reference: record.reference_no})}
            deletedMessage={t('documentVoidedMessage')}
            renderForm={(props) => <AdjustmentForm {...props} />}
        />
    );
}
