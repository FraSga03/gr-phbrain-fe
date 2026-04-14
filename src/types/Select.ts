import type { UseFormRegisterReturn } from "react-hook-form";

export type Option = {
    label: string;
    value: string | number;
};

export  type SelectProps = {
    options: Option[];
    placeholder?: string;
    error?: { message?: string };
    registration?: UseFormRegisterReturn;
};