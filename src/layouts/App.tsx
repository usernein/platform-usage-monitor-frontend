import { Suspense, type PropsWithChildren } from "react"
import { AppShell } from "@mantine/core"
import AppHeader from "./AppHeader"
import classes from "./styles/App.module.css"

export default function App({ children }: PropsWithChildren) {
    return (
        <AppShell
            padding="md"
            classNames={{
                header: classes.header,
                main: classes.main,
            }}
            header={{ height: 60 }}
        >
            <AppShell.Header>
                <AppHeader />
            </AppShell.Header>
            <AppShell.Main>
                <Suspense fallback={<div>Loading</div>}>{children}</Suspense>
            </AppShell.Main>
        </AppShell>
    )
}
