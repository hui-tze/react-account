import {updateLocationTransfer, useGetOneLocationTransfer, voidLocationTransfer} from "@/apis/requests/location-transfer-api";
import SettingsEditPage from "@/views/Settings/shared/SettingsEditPage";
import {useSmartTranslation} from "@/hooks/use-translation";
import {TransferForm} from "../TransferForm";
import {TRANSFERS_PATH} from "../../inventory-menu";

export default function EditTransfer() {
    const {t} = useSmartTranslation();

    return (
        <SettingsEditPage
            useGetOne={useGetOneLocationTransfer}
            update={updateLocationTransfer}
            remove={voidLocationTransfer}
            backTo={TRANSFERS_PATH}
            deleteText={(record) => t('documentVoidText', {reference: record.reference_no})}
            deletedMessage={t('documentVoidedMessage')}
            renderForm={(props) => <TransferForm {...props} />}
        />
    );
}
