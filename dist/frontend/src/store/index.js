"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAppSelector = exports.useAppDispatch = exports.store = void 0;
const toolkit_1 = require("@reduxjs/toolkit");
const react_redux_1 = require("react-redux");
const authSlice_1 = require("./slices/authSlice");
exports.store = (0, toolkit_1.configureStore)({
    reducer: {
        auth: authSlice_1.default,
    },
});
exports.useAppDispatch = react_redux_1.useDispatch;
exports.useAppSelector = react_redux_1.useSelector;
//# sourceMappingURL=index.js.map