"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Button;
const react_1 = require("react");
function Button({ loading, variant = "default", className, children, ...props }) {
    const baseClasses = "inline-flex items-center justify-center rounded-md px-4 py-2 disabled:cursor-not-allowed disabled:opacity-70";
    const variantClasses = {
        default: "bg-black text-white hover:bg-black/90",
        outline: "border border-black text-black hover:bg-black hover:text-white",
        full: "w-full bg-black text-white hover:bg-black/90"
    };
    return (<button {...props} className={`${baseClasses} ${variantClasses[variant]} ${className ?? ""}`}>
      {loading ? "Loading..." : children}
    </button>);
}
//# sourceMappingURL=Button.js.map