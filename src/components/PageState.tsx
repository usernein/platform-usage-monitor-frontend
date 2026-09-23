import { Alert, Button, Center, Loader, Stack, Text, ThemeIcon } from "@mantine/core"
import { AlertCircle, Inbox } from "lucide-react"

export function PageLoader({ label = "Carregando dados..." }: { label?: string }) {
    return (
        <Center mih={320}>
            <Stack align="center" gap="sm">
                <Loader color="indigo" />
                <Text c="dimmed" size="sm">
                    {label}
                </Text>
            </Stack>
        </Center>
    )
}

interface PageErrorProps {
    message?: string
    onRetry?: () => void
}

export function PageError({ message = "Não foi possível carregar os dados.", onRetry }: PageErrorProps) {
    return (
        <Alert
            color="red"
            radius="md"
            title="Algo deu errado"
            icon={<AlertCircle size={18} />}
        >
            <Stack align="flex-start" gap="sm">
                <Text size="sm">{message}</Text>
                {onRetry && (
                    <Button color="red" variant="light" size="xs" onClick={onRetry}>
                        Tentar novamente
                    </Button>
                )}
            </Stack>
        </Alert>
    )
}

export function EmptyState({ message }: { message: string }) {
    return (
        <Center mih={220}>
            <Stack align="center" gap="sm">
                <ThemeIcon variant="light" color="gray" size={44} radius="xl">
                    <Inbox size={22} />
                </ThemeIcon>
                <Text c="dimmed" ta="center">
                    {message}
                </Text>
            </Stack>
        </Center>
    )
}
