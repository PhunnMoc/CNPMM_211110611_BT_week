"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const js_cookie_1 = require("js-cookie");
const api = axios_1.default.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
    withCredentials: false,
});
api.interceptors.request.use((config) => {
    const token = js_cookie_1.default.get("access_token");
    if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
exports.default = api;
//# sourceMappingURL=axios.js.map