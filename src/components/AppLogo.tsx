import { ThemeIcon } from "@mantine/core"
import { Activity } from "lucide-react"

interface AppLogoProps {
    size?: number
}

export function AppLogo({ size = 40 }: AppLogoProps) {
    return (
        <ThemeIcon size={size} radius="md" color="indigo" variant="filled">
            <Activity size={Math.round(size * 0.55)} aria-hidden="true" />
        </ThemeIcon>
    )
}
