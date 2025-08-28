"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Input;
const react_1 = require("react");
function Input({ label, error, className, ...props }) {
    return (<div className="w-full">
      {label && (<label className="mb-1 block text-sm font-medium text-gray-700">
          {label}
        </label>)}
      <input className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none ${className ?? ""}`} {...props}/>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>);
}
//# sourceMappingURL=Input.js.map