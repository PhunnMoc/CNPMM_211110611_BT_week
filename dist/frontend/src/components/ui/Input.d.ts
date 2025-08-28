import React from "react";
type Props = React.InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
    error?: string;
};
export default function Input({ label, error, className, ...props }: Props): React.JSX.Element;
export {};
