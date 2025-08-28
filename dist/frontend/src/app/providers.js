"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Providers;
const store_1 = require("@/store");
const react_redux_1 = require("react-redux");
function Providers({ children }) {
    return <react_redux_1.Provider store={store_1.store}>{children}</react_redux_1.Provider>;
}
//# sourceMappingURL=providers.js.map