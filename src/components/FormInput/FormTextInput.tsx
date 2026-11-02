import { Col, Form } from "react-bootstrap";
import type {
    FieldError,
    FieldValues,
    Path,
    UseFormRegister,
} from "react-hook-form";

interface FormTextInputProps<T extends FieldValues> {
    label: string;
    name: Path<T>;
    maxLength?: number;
    register: UseFormRegister<T>;
    error?: FieldError;
    required?: boolean;
}

export function FormTextInput<T extends FieldValues>({
    label,
    name,
    maxLength,
    register,
    error,
    required = true,
}: FormTextInputProps<T>) {
    return (
        <Form.Group className="mb-3">
            <Form.Label className={required ? "require-label" : ""}>
                {label}
            </Form.Label>

            <Form.Control
                type="text"
                maxLength={maxLength}
                isInvalid={!!error}
                {...register(name, {
                    required: required ? "*Required" : false,
                })}
            />

            <Form.Control.Feedback type="invalid">
                {error?.message}
            </Form.Control.Feedback>
        </Form.Group>
    );
}
