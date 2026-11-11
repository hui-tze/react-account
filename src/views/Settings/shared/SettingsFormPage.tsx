import {FormEventHandler, ReactNode} from "react";
import {Button, Container, Form, Spinner} from "react-bootstrap";
import {useNavigate} from "react-router-dom";
import SimpleBar from "simplebar-react";
import {Lock} from "react-feather";
import {useSmartTranslation} from "@/hooks/use-translation";
import {useAccess} from "@/providers/access";

export type SettingsFormPageProps = {
    onSubmit: FormEventHandler<HTMLFormElement>,
    submitting: boolean,
    isEditing: boolean,
    // where Cancel goes; omit to hide Cancel (single-record settings pages)
    backTo?: string,
    onDelete?: () => void,
    submitLabel?: string,
    // label of the delete button (e.g. "Void" for posted documents)
    deleteLabel?: string,
    // view-only record: hides the submit button
    readOnly?: boolean,
    // keep the buttons pinned to the bottom of the viewport (long document forms)
    stickyActions?: boolean,
    // shown left of the buttons, e.g. the document total
    actionsSummary?: ReactNode,
    // document entry: one centred column of numbered sections (sales / purchase documents)
    documentLayout?: boolean,
    children: ReactNode,
};

/** Page chrome shared by every settings create/edit form: scroll body + action buttons. */
export default function SettingsFormPage({onSubmit, submitting, isEditing, backTo, onDelete, submitLabel, deleteLabel, readOnly, stickyActions, actionsSummary, documentLayout, children}: SettingsFormPageProps) {
    const {t} = useSmartTranslation();
    const navigate = useNavigate();
    const {canHere} = useAccess();
    // the user's role decides whether this record can be saved / deleted here
    const allowed = canHere(isEditing ? "edit" : "create");
    const locked = !allowed && !readOnly;
    const canDelete = !!onDelete && canHere("delete");

    // delete on the left, away from cancel / save on the right
    const actions = (
        <>
            {canDelete && (
                <Button variant="outline-danger" type="button" onClick={onDelete}>{deleteLabel ?? t('delete')}</Button>
            )}
            {actionsSummary && <div className="form-sticky-actions-summary">{actionsSummary}</div>}
            <div className="d-flex gap-2 ms-auto">
                {backTo && (
                    <Button variant="outline-secondary" type="button" onClick={() => navigate(backTo)}>{t('cancel')}</Button>
                )}
                {!readOnly && allowed && (
                    <Button type="submit" variant="primary" disabled={submitting}>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className={submitting ? "me-2" : "d-none"} />
                        {submitLabel ?? (isEditing ? t('saveChanges') : t('create'))}
                    </Button>
                )}
            </div>
        </>
    );

    return (
        <div className="app-body">
            <SimpleBar className="nicescroll-bar">
                <Container fluid className={documentLayout ? "py-3 doc-entry-page" : "py-3"}>
                    <Form noValidate onSubmit={onSubmit}>
                        {locked && (
                            <div className="access-view-only"><Lock size={14} />{t(isEditing ? 'viewOnlyCannotEdit' : 'viewOnlyCannotCreate')}</div>
                        )}
                        {/* without permission the fields are shown but can't be changed */}
                        <fieldset disabled={locked} className="access-fieldset">
                            {documentLayout ? <div className="doc-entry">{children}</div> : children}
                        </fieldset>

                        {stickyActions ? (
                            <div className="form-sticky-actions">
                                {documentLayout ? <div className="doc-entry-bar">{actions}</div> : actions}
                            </div>
                        ) : (
                            <div className="d-flex flex-wrap align-items-center gap-2 mt-3">{actions}</div>
                        )}
                    </Form>
                </Container>
            </SimpleBar>
        </div>
    );
}

export function FormSectionTitle({title, hint}: {title: string, hint?: string}) {
    return (
        <div className="mb-2 mt-1">
            <div className="text-uppercase text-primary small fw-semibold" style={{letterSpacing: ".06em"}}>{title}</div>
            {hint && <p className="text-muted small mb-0">{hint}</p>}
        </div>
    );
}
