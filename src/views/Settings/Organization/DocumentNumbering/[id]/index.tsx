import {deleteDocumentNumbering, updateDocumentNumbering, useGetOneDocumentNumbering} from "@/apis/requests/document-numbering-api";
import SettingsEditPage from "@/views/Settings/shared/SettingsEditPage";
import {useSmartTranslation} from "@/hooks/use-translation";
import {DocumentNumberingForm} from "../DocumentNumberingForm";
import {DOCUMENT_NUMBERING_PATH, useDocumentTypeLabel} from "../index";

export default function EditDocumentNumbering() {
    const {t} = useSmartTranslation();
    const {labelOf} = useDocumentTypeLabel();

    return (
        <SettingsEditPage
            useGetOne={useGetOneDocumentNumbering}
            update={updateDocumentNumbering}
            remove={deleteDocumentNumbering}
            backTo={DOCUMENT_NUMBERING_PATH}
            deleteText={(record) => t('recordDeactivateNamed', {name: labelOf(record.document_type)})}
            renderForm={(props) => <DocumentNumberingForm {...props} />}
        />
    );
}
