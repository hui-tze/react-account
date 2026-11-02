import {useNotification} from "./notification";
import {useBoolean} from "./use-boolean";
import {ChangeEvent, MutableRefObject, ReactNode} from "react";
import type {FieldValues, PathValue, RegisterOptions} from "react-hook-form";
import {useForm} from "react-hook-form";
import type {
    UseFormProps,
    UseFormRegisterReturn,
    FieldPath,
    Message,
    ValidationRule,
} from "react-hook-form";
import {Props} from "react-select";
import DateRangePicker from "react-bootstrap-daterangepicker";

export type FormSubmitRequestHandler<T, U extends FieldValues> = {
    request: (formData: U) => Promise<T>,
    onSuccess?: (data: T) => Promise<void>
}

export type RequestHandler<T> = {
    request: Promise<T>,
    onSuccess?: (data: T) => Promise<void>
}

export type UseRequestForm<TForm extends FieldValues> = {
    formOptions?: UseFormProps<TForm>
}

export type ErrorMessage = string|ReactNode|undefined;

export type FormControlRegisterProps = {
    isInvalid: boolean,
    error: ErrorMessage,
}

export type ReactFormRegister<TFieldValues extends FieldValues> =
    <TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(name: TFieldName, options?: RegisterOptions<TFieldValues, TFieldName>, onChangeCb?: (value: string) => void)
        => UseFormRegisterReturn<TFieldName> & FormControlRegisterProps;

export type ReactFormBaseRegister<TFieldValues extends FieldValues> =
    <TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(name: TFieldName, options?: RegisterOptions<TFieldValues, TFieldName>)
        => UseFormRegisterReturn<TFieldName>;

export type ReactDateFormRegister<TFieldValues extends FieldValues> = <TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(name: TFieldName, ref: MutableRefObject<DateRangePicker | null>, options?: RegisterOptions<TFieldValues, TFieldName>) => Omit<UseFormRegisterReturn<TFieldName>, "onChange"> & FormControlRegisterProps;

export type ReactSelectFormRegister<TFieldValues extends FieldValues> = <TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(name: TFieldName, options?: RegisterOptions<TFieldValues, TFieldName>, onChangeCb?: (value: string) => void) => Omit<UseFormRegisterReturn<TFieldName>, "onChange"> & FormControlRegisterProps;

export type ReactCheckboxFormRegister<TFieldValues extends FieldValues> = <TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(name: TFieldName, options?: RegisterOptions<TFieldValues, TFieldName>, onChangeCb?: (value: boolean) => void) => Omit<UseFormRegisterReturn<TFieldName>, "onChange"> & {
    onChange: (e: ChangeEvent<HTMLInputElement>) => void,
} & FormControlRegisterProps;

export type ReactRadioFormRegister<TFieldValues extends FieldValues> = <TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(name: TFieldName, transform: (value: string) => PathValue<TFieldValues, TFieldName>, options?: RegisterOptions<TFieldValues, TFieldName>) => Omit<UseFormRegisterReturn<TFieldName>, "onChange"|"name"> & {
    onChange: (value: string) => void,
} & FormControlRegisterProps;

export type TransformableSelectFormRegister<TFieldValues extends FieldValues> = <TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(name: TFieldName, transform: (value: string) => PathValue<TFieldValues, TFieldName>, options?: RegisterOptions<TFieldValues, TFieldName>, onChangeCb?: (value: string) => void) => Omit<UseFormRegisterReturn<TFieldName>, "onChange"> & {
    onChange: (value: string|null) => void,
};

/* 
export type MantineSelectTransformableClearableFormRegister<TFieldValues extends FieldValues> = <TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(name: TFieldName, transform: (value: string[]|null) => PathValue<TFieldValues, TFieldName>, options?: RegisterOptions<TFieldValues, TFieldName>, onChangeCb?: (value: string) => void) => Omit<UseFormRegisterReturn<TFieldName>, "onChange"> & {
    onChange: (value: string[]|null) => void,
    defaultValue: string[]|undefined,
} & FormControlRegisterProps;


export type MantineTimeFormRegister<TFieldValues extends FieldValues> = <TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(name: TFieldName, ref: MutableRefObject<HTMLInputElement | null>, options?: RegisterOptions<TFieldValues, TFieldName>) => UseFormRegisterReturn<TFieldName> & {
    rightSection: ReactNode,
} & FormControlRegisterProps; */

function needAsterisk(required: Message | ValidationRule<boolean> | undefined) {
    return typeof required == "string" || required == true;
}

export function useRequestForm<TFieldValues extends FieldValues>({formOptions}: UseRequestForm<TFieldValues> = {}) {
    const {register: baseRegister, formState, ...formHandler } = useForm<TFieldValues>(formOptions);
    const toast = useNotification();
    const [submitting, setSubmitting] = useBoolean(false);

    function handleSubmitRequest<TRespond>({request, onSuccess}: FormSubmitRequestHandler<TRespond, TFieldValues>) {
        return formHandler.handleSubmit((formData) => {
            setSubmitting.on();
            request(formData)
                .then(async (data) => {
                    if(onSuccess) {
                        return await onSuccess(data);
                    }
                })
                .then(() => toast.success())
                .catch(e => {
                    toast.error(e);
                })
                .finally(() => {
                    setSubmitting.off();
                });
        });
    }

    const register: ReactFormRegister<TFieldValues> = (name, options, onChangeCb) => {
        const {onChange, ...restRegistered} = baseRegister(name, options);
        return {
            ...restRegistered,
            onChange: (ev: { target: any; type?: any; }) => {
                onChangeCb && onChangeCb(ev.target.value);
                return onChange(ev);
            },
            isInvalid: formHandler.getFieldState(name, formState).error?.message ? true : false,
            error: formHandler.getFieldState(name, formState).error?.message as ErrorMessage,
        };
    };

    const registerBase: ReactFormBaseRegister<TFieldValues> = (name, options) => {
        const registered = baseRegister(name, options);
        return {
            ...registered,
        };
    };

    const registerSelect: ReactSelectFormRegister<TFieldValues> = (name, options, onChangeCb) => {
        const registered = baseRegister(name, options);
        return {
            ...registered,
            /* onChange: (data) => {
                if (data == null || data === "") return;
                onChangeCb && onChangeCb(data.target.value);
                formHandler.setValue(name, data.target.value);
            }, */
            defaultValue: formHandler.getValues(name) ? formHandler.getValues(name) : '',
            isInvalid: formHandler.getFieldState(name, formState).error?.message ? true : false,
            error: formHandler.getFieldState(name, formState).error?.message as ErrorMessage,
        };
    };

    const registerDate: ReactDateFormRegister<TFieldValues> = (name, ref, options) => {
        const registered = baseRegister(name, options);

        return {
            ...registered,
            ref: (r) => {
                ref.current = r;
                registered.ref(r);
            },
            control: formHandler.control,
            isInvalid: formHandler.getFieldState(name, formState).error?.message ? true : false,
            error: formHandler.getFieldState(name, formState).error?.message as ErrorMessage,
        };
    };

    const registerCheckbox: ReactCheckboxFormRegister<TFieldValues> = (name, options, onChangeCb) => {
        const registered = baseRegister(name, options);

        return {
            ...registered,
            onChange: (e) => {
                const checked = e.currentTarget.checked;
                onChangeCb && onChangeCb(checked);
                formHandler.setValue(name, checked as PathValue<TFieldValues, FieldPath<TFieldValues>>);
            },
            isInvalid: formHandler.getFieldState(name, formState).error?.message ? true : false,
            error: formHandler.getFieldState(name, formState).error?.message as ErrorMessage,
        };
    };

    const registerRadio: ReactRadioFormRegister<TFieldValues> = (name, transform, options) => {
        const registered = baseRegister(name, options);
        return {
            ref: () => {},
            onBlur: registered.onBlur,
            onChange: (data) => {
                if (!data) return;
                formHandler.setValue(name, transform(data));
            },
            isInvalid: formHandler.getFieldState(name, formState).error?.message ? true : false,
            error: formHandler.getFieldState(name, formState).error?.message as ErrorMessage,
        };
    };

    const registerSelectTransformable: TransformableSelectFormRegister<TFieldValues> = (name, transform, options, onChangeCb) => {
        const registered = baseRegister(name, options);

        return {
            ...registered,
            onChange: (data) => {
                if (data == null || data == "") return;
                onChangeCb && onChangeCb(data);
                formHandler.setValue(name, transform(data));
            },
            withAsterisk: needAsterisk(options?.required),
            error: formHandler.getFieldState(name, formState).error?.message as ErrorMessage,
        };
    };


/*     

    

    const registerClearableSelect: MantineSelectFormRegister<TFieldValues> = (name, options) => {
        const registered = baseRegister(name, options);

        return {
            ...registered,
            onChange: (data) => {
                formHandler.setValue(name, data as never);
            },
            withAsterisk: needAsterisk(options?.required),
            error: formHandler.getFieldState(name, formState).error?.message as ErrorMessage,
        };
    };

    const registerTransformableMultiSelect: MantineSelectTransformableClearableFormRegister<TFieldValues> = (name, transform, options) => {
        const registered = baseRegister(name, options);

        return {
            ...registered,
            onChange: (data) => {
                formHandler.setValue(name, transform(data));
            },
            defaultValue: formHandler.getValues(name) ? formHandler.getValues(name).map((v:never) => `${v}`) : undefined,
            withAsterisk: needAsterisk(options?.required),
            error: formHandler.getFieldState(name, formState).error?.message as ErrorMessage,
        };
    };

    const registerSelectTransformable: MantineTransformableSelectFormRegister<TFieldValues> = (name, transform, options, onChangeCb) => {
        const registered = baseRegister(name, options);

        return {
            ...registered,
            onChange: (data) => {
                if (data == null || data == "") return;
                onChangeCb && onChangeCb(data);
                formHandler.setValue(name, transform(data));
            },
            withAsterisk: needAsterisk(options?.required),
            error: formHandler.getFieldState(name, formState).error?.message as ErrorMessage,
        };
    };

    const registerTime: MantineTimeFormRegister<TFieldValues> = (name, ref, options) => {
        const registered = baseRegister(name, options);

        return {
            ...registered,
            ref: (r) => {
                ref.current = r;
                registered.ref(r);
            },
            withAsterisk: needAsterisk(options?.required),
            error: formHandler.getFieldState(name, formState).error?.message as ErrorMessage,
            rightSection: (
                <ActionIcon onClick={() => ref.current?.showPicker()}>
                    <AiOutlineClockCircle size="1rem" />
                </ActionIcon>
            ),
        };
    };

     */

    return {
        ...formHandler,
        formState,
        register,
        registerBase,
        registerDate,
        registerSelect,
        registerCheckbox,
        registerRadio,
        registerSelectTransformable,
        handleSubmitRequest,
        submitting
    };
}
