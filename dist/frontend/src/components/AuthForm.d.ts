import React from "react";
type Mode = "login" | "register" | "forgot";
export default function AuthForm({ mode }: {
    mode: Mode;
}): React.JSX.Element;
export {};
