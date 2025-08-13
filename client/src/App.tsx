import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import { Fragment } from "react";
import DefaultLayout from "~/layouts/DefaultLayout";
import ProtectedRoute from "~/components/Auth/ProtectedRoute";
import PublicRoute from "~/components/Auth/PublicRoute";
import SessionStatus from "~/components/Auth/SessionStatus";
import { publicRoutes, privateRoutes } from "./routes/routes";
import NotFound from "./page/404Page";
import Unauthorized from "./page/Unauthorized";
import type { PublicRoute as PublicRouteType, PrivateRoute as PrivateRouteType } from "./routes/routes";
import SessionWarningModal from "./components/Auth/SessionWarningModal";

function App() {
    const renderRoute = (route: PublicRouteType | PrivateRouteType, index: number, isPrivate = false) => {
        const Page = route.component;
        const Layout = route.layout === null ? Fragment : route.layout || DefaultLayout;
        const Wrapper = isPrivate ? ProtectedRoute : PublicRoute;

        const wrapperProps = isPrivate
            ? {
                  access: (route as PrivateRouteType).access,
                  fallbackPath: route.path.includes("/admin") ? "/admin/login" : "/login",
              }
            : {
                  redirectPath: (route as PublicRouteType).redirectPath,
                  allowedWhenAuthenticated: (route as PublicRouteType).allowedWhenAuthenticated,
              };

        return (
            <Route
                key={`${isPrivate ? "private" : "public"}-${route.path}`}
                path={route.path}
                element={
                    <Wrapper {...wrapperProps}>
                        <Layout>
                            <Page />
                        </Layout>
                    </Wrapper>
                }
            />
        );
    };

    return (
        <Router>
            <div className="App">
                {/* Global Components */}
                <SessionWarningModal />
                <SessionStatus />

                <Routes>
                    {/* Public Routes */}
                    {publicRoutes.map((route, index) => renderRoute(route, index))}

                    {/* Private Routes */}
                    {privateRoutes.map((route, index) => renderRoute(route, index, true))}

                    {/* Unauthorized */}
                    <Route
                        path="/unauthorized"
                        element={
                            <DefaultLayout>
                                <Unauthorized />
                            </DefaultLayout>
                        }
                    />

                    {/* 404 Page */}
                    <Route
                        path="*"
                        element={
                            <DefaultLayout>
                                <NotFound />
                            </DefaultLayout>
                        }
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
