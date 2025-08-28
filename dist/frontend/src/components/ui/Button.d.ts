import React from "react";
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    loading?: boolean;
    variant?: "default" | "outline" | "full";
};
export default function Button({ loading, variant, className, children, ...props }: Props): React.JSX.Element;
export {};
