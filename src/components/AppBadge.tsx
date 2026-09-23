import type { ReactNode } from "react"
import { Badge, type BadgeProps } from "@mantine/core"
import classes from "./AppBadge.module.css"

export type AppBadgeTone =
    | "info"
    | "success"
    | "warning"
    | "danger"
    | "neutral"
    | "student"
    | "teacher"
    | "manager"

interface AppBadgeProps extends Omit<BadgeProps, "color" | "variant" | "children"> {
    children: ReactNode
    tone?: AppBadgeTone
    appearance?: "light" | "outline" | "dot"
    active?: boolean
    onClick?: () => void
}

const toneColors: Record<AppBadgeTone, string> = {
    info: "indigo",
    success: "teal",
    warning: "yellow",
    danger: "red",
    neutral: "gray",
    student: "indigo",
    teacher: "cyan",
    manager: "grape",
}

export function AppBadge({
    children,
    tone = "neutral",
    appearance = "light",
    active,
    onClick,
    ...props
}: AppBadgeProps) {
    return (
        <Badge
            component={onClick ? "button" : "div"}
            type={onClick ? "button" : undefined}
            color={toneColors[tone]}
            variant={active ? "filled" : appearance}
            radius="sm"
            classNames={{ root: classes.root, label: classes.label }}
            onClick={onClick}
            data-clickable={Boolean(onClick) || undefined}
            {...props}
        >
            {children}
        </Badge>
    )
}
