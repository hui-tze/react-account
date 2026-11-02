import {addDocumentNumbering} from "@/apis/requests/document-numbering-api";
import {SettingsCreatePage} from "@/views/Settings/shared/SettingsEditPage";
import {DocumentNumberingForm} from "../DocumentNumberingForm";
import {DOCUMENT_NUMBERING_PATH} from "../index";

export default function CreateDocumentNumbering() {
    return <SettingsCreatePage create={addDocumentNumbering} backTo={DOCUMENT_NUMBERING_PATH} renderForm={(props) => <DocumentNumberingForm {...props} />} />;
}
