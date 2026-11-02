import {ReactNode} from "react";

export type FormSectionProps = {
    title: string,
    hint?: string,
    children: ReactNode,
}

export default function FormSection({title, hint, children}: FormSectionProps) {
    return (
        <fieldset className="mb-4 border-0 p-0">
            <legend className="text-uppercase text-primary small fw-semibold mb-2" style={{letterSpacing: ".06em"}}>
                {title}
            </legend>
            {hint && <p className="text-muted small mt-n1 mb-2">{hint}</p>}
            {children}
        </fieldset>
    );
}
