import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slices/auth.slice";
// import contractSlice from "./slices/contract.slice";
// import dashboardReducer from "./slices/dashboard.slice";

export const store = configureStore({
    reducer: {
        auth: authSlice,
        // contract: contractSlice,
        // users: userSlice,
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
