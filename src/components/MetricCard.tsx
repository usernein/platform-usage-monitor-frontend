import type { ReactNode } from "react"
import { Group, Paper, Stack, Text, ThemeIcon } from "@mantine/core"
import { Link } from "react-router-dom"
import classes from "./styles/MetricCard.module.css"

interface MetricCardProps {
    label: string
    value: string
    description: string
    icon: ReactNode
    color?: string
    to?: string
}

export function MetricCard({
    label,
    value,
    description,
    icon,
    color = "indigo",
    to,
}: MetricCardProps) {
    const content = (
        <>
            <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Stack gap={3}>
                    <Text c="dimmed" size="sm" fw={500}>
                        {label}
                    </Text>
                    <Text fz={28} fw={700} lh={1.2}>
                        {value}
                    </Text>
                    <Text c="dimmed" size="xs">
                        {description}
                    </Text>
                </Stack>
                <ThemeIcon color={color} variant="light" size={42} radius="md">
                    {icon}
                </ThemeIcon>
            </Group>
        </>
    )

    if (to) {
        return (
            <Paper
                component={Link}
                to={to}
                className={classes.card}
                withBorder
                radius="md"
                p="lg"
                data-clickable
            >
                {content}
            </Paper>
        )
    }

    return (
        <Paper className={classes.card} withBorder radius="md" p="lg">
            {content}
        </Paper>
    )
}
