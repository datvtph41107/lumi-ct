// // Auth Middleware
// import type { Middleware } from "@reduxjs/toolkit";
// import type { RootState } from "../store";
// import { resetAuth, updateLastActivity } from "../slices/auth/auth.slice";

// export const authMiddleware: Middleware<{}, RootState> = (store) => (next) => (action) => {
//     const result = next(action);

//     // Update last activity on successful auth actions
//     if (action.type.includes("auth/") && action.type.includes("/fulfilled")) {
//         store.dispatch(updateLastActivity());
//     }

//     // Handle authentication errors globally
//     if (action.type.endsWith("/rejected") && action.type.startsWith("auth/")) {
//         const error = action.payload as string;

//         if (error.includes("unauthorized") || error.includes("token") || error.includes("expired") || error.includes("invalid")) {
//             store.dispatch(resetAuth());

//             // Redirect to login if not already there
//             const currentPath = window.location.pathname;
//             if (!currentPath.includes("/login")) {
//                 window.location.href = "/login";
//             }
//         }
//     }

//     return result;
// };
