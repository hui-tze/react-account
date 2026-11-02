import {FormEventHandler, ReactNode} from "react";
import {Button, Container, Form, Spinner} from "react-bootstrap";
import {useNavigate} from "react-router-dom";
import SimpleBar from "simplebar-react";
import {useSmartTranslation} from "@/hooks/use-translation";

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
    children: ReactNode,
};

/** Page chrome shared by every settings create/edit form: scroll body + action buttons. */
export default function SettingsFormPage({onSubmit, submitting, isEditing, backTo, onDelete, submitLabel, deleteLabel, readOnly, stickyActions, actionsSummary, children}: SettingsFormPageProps) {
    const {t} = useSmartTranslation();
    const navigate = useNavigate();

    return (
        <div className="app-body">
            <SimpleBar className="nicescroll-bar">
                <Container fluid className="py-3">
                    <Form noValidate onSubmit={onSubmit}>
                        {children}

                        <div className={stickyActions ? "form-sticky-actions" : "d-flex gap-2 mt-3"}>
                            {actionsSummary && <div className="form-sticky-actions-summary">{actionsSummary}</div>}
                            {backTo && (
                                <Button variant="outline-secondary" type="button" onClick={() => navigate(backTo)}>{t('cancel')}</Button>
                            )}
                            {!readOnly && (
                                <Button type="submit" variant="primary" disabled={submitting}>
                                    <Spinner as="span" animation="border" size="sm" className={submitting ? "me-2" : "d-none"} />
                                    {submitLabel ?? (isEditing ? t('saveChanges') : t('create'))}
                                </Button>
                            )}
                            {onDelete && (
                                <Button variant="outline-danger" type="button" className="ms-auto" onClick={onDelete}>{deleteLabel ?? t('delete')}</Button>
                            )}
                        </div>
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
