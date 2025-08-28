"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.fetchProfile = exports.forgotPassword = exports.register = exports.login = void 0;
const toolkit_1 = require("@reduxjs/toolkit");
const js_cookie_1 = require("js-cookie");
const axios_1 = require("@/lib/axios");
const initialState = {
    user: null,
    status: "idle",
    error: null,
};
exports.login = (0, toolkit_1.createAsyncThunk)("auth/login", async (payload, { rejectWithValue }) => {
    try {
        const res = await axios_1.default.post("/auth/login", payload);
        const token = res.data.access_token;
        js_cookie_1.default.set("access_token", token);
        return res.data.user;
    }
    catch (err) {
        return rejectWithValue(err?.response?.data?.message || "Login failed");
    }
});
exports.register = (0, toolkit_1.createAsyncThunk)("auth/register", async (payload, { rejectWithValue }) => {
    try {
        const res = await axios_1.default.post("/auth/register", payload);
        return res.data.user;
    }
    catch (err) {
        return rejectWithValue(err?.response?.data?.message || "Register failed");
    }
});
exports.forgotPassword = (0, toolkit_1.createAsyncThunk)("auth/forgotPassword", async (payload, { rejectWithValue }) => {
    try {
        const res = await axios_1.default.post("/auth/forgot-password", payload);
        return res.data;
    }
    catch (err) {
        return rejectWithValue(err?.response?.data?.message || "Request failed");
    }
});
exports.fetchProfile = (0, toolkit_1.createAsyncThunk)("auth/profile", async (_, { rejectWithValue }) => {
    try {
        const res = await axios_1.default.get("/auth/me");
        return res.data;
    }
    catch (err) {
        return rejectWithValue("Unauthorized");
    }
});
const authSlice = (0, toolkit_1.createSlice)({
    name: "auth",
    initialState,
    reducers: {
        logout(state) {
            js_cookie_1.default.remove("access_token");
            state.user = null;
            state.status = "idle";
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(exports.login.pending, (state) => {
            state.status = "loading";
            state.error = null;
        })
            .addCase(exports.login.fulfilled, (state, action) => {
            state.status = "succeeded";
            state.user = action.payload;
        })
            .addCase(exports.login.rejected, (state, action) => {
            state.status = "failed";
            state.error = action.payload || "Login failed";
        })
            .addCase(exports.register.pending, (state) => {
            state.status = "loading";
            state.error = null;
        })
            .addCase(exports.register.fulfilled, (state, action) => {
            state.status = "succeeded";
            state.user = action.payload;
        })
            .addCase(exports.register.rejected, (state, action) => {
            state.status = "failed";
            state.error = action.payload || "Register failed";
        })
            .addCase(exports.fetchProfile.pending, (state) => {
            state.status = "loading";
        })
            .addCase(exports.fetchProfile.fulfilled, (state, action) => {
            state.status = "succeeded";
            state.user = action.payload;
        })
            .addCase(exports.fetchProfile.rejected, (state, action) => {
            state.status = "failed";
            state.error = action.payload || null;
        });
    },
});
exports.logout = authSlice.actions.logout;
exports.default = authSlice.reducer;
//# sourceMappingURL=authSlice.js.map