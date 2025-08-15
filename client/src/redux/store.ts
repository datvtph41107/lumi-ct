import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slices/auth.slice";
import contractSlice from "./slices/contract.slice";
import userSlice from "./slices/user.slice";
import dashboardSlice from "./slices/dashboard.slice";

export const store = configureStore({
    reducer: {
        auth: authSlice,
        contract: contractSlice,
        user: userSlice,
        dashboard: dashboardSlice,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ["persist/PERSIST"],
            },
        }),
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
