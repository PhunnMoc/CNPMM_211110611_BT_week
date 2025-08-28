import { TypedUseSelectorHook } from "react-redux";
export declare const store: import("@reduxjs/toolkit").EnhancedStore<{
    auth: import("immer").WritableDraft<{
        user: {
            id: string;
            email: string;
            firstName?: string;
            lastName?: string;
            isEmailVerified?: boolean;
        } | null;
        status: "idle" | "loading" | "succeeded" | "failed";
        error?: string | null;
    }>;
}, import("redux").UnknownAction, import("@reduxjs/toolkit").Tuple<[import("redux").StoreEnhancer<{
    dispatch: import("redux-thunk").ThunkDispatch<{
        auth: import("immer").WritableDraft<{
            user: {
                id: string;
                email: string;
                firstName?: string;
                lastName?: string;
                isEmailVerified?: boolean;
            } | null;
            status: "idle" | "loading" | "succeeded" | "failed";
            error?: string | null;
        }>;
    }, undefined, import("redux").UnknownAction>;
}>, import("redux").StoreEnhancer]>>;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export declare const useAppDispatch: () => AppDispatch;
export declare const useAppSelector: TypedUseSelectorHook<RootState>;
