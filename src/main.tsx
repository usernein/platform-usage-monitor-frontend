import "@mantine/core/styles.css"
import "@mantine/charts/styles.css"
import "@mantine/dates/styles.css"
import "@mantine/schedule/styles.css"
import React, { lazy } from "react"
import ReactDOM from "react-dom/client"
import { MantineProvider } from "@mantine/core"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import App from "./layouts/App"
import { theme } from "./theme"

const HomePage = lazy(() =>
    import("./pages/HomePage").then((module) => ({ default: module.HomePage })),
)
const InstitutionDashboardPage = lazy(() =>
    import("./pages/InstitutionDashboardPage").then((module) => ({
        default: module.InstitutionDashboardPage,
    })),
)
const InstitutionUsersPage = lazy(() =>
    import("./pages/InstitutionUsersPage").then((module) => ({
        default: module.InstitutionUsersPage,
    })),
)
const InstitutionUsagePlansPage = lazy(() =>
    import("./pages/InstitutionUsagePlansPage").then((module) => ({
        default: module.InstitutionUsagePlansPage,
    })),
)
const UserDetailPage = lazy(() =>
    import("./pages/UserDetailPage").then((module) => ({
        default: module.UserDetailPage,
    })),
)

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30_000,
            retry: 1,
        },
    },
})

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <MantineProvider theme={theme} defaultColorScheme="light">
                <BrowserRouter>
                    <App>
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route
                                path="/institutions/:institutionId"
                                element={<InstitutionDashboardPage />}
                            />
                            <Route
                                path="/institutions/:institutionId/users"
                                element={<InstitutionUsersPage />}
                            />
                            <Route
                                path="/institutions/:institutionId/usage-plans"
                                element={<InstitutionUsagePlansPage />}
                            />
                            <Route path="/users/:userId" element={<UserDetailPage />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </App>
                </BrowserRouter>
            </MantineProvider>
        </QueryClientProvider>
    </React.StrictMode>,
)
