import { useForm, FormProvider } from "react-hook-form";
import type { UseFormProps, SubmitHandler, FieldValues, FieldErrors } from "react-hook-form";
import React from "react";

interface FormProps<T extends FieldValues> {
    defaultValues?: UseFormProps<T>["defaultValues"];
    onSubmit: SubmitHandler<T>;
    children: React.ReactNode;
    className?: string;
    onError?: (errors: FieldErrors<T>) => void;
}

const Form = <T extends FieldValues>({ defaultValues, onSubmit, onError, children, className }: FormProps<T>) => {
    const methods = useForm<T>({
        defaultValues,
        mode: "onSubmit",
        reValidateMode: "onSubmit",
        shouldFocusError: false,
    });

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit, onError)} className={className} noValidate>
                {children}
            </form>
        </FormProvider>
    );
};

export default Form;
