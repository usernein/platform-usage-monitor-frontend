import { Paper, Stack, Text, Title } from "@mantine/core"

interface PlaceholderPageProps {
    title: string
    description: string
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
    return (
        <Stack gap="lg">
            <div>
                <Title order={1} size="h2">
                    {title}
                </Title>
                <Text c="dimmed" mt={4}>
                    {description}
                </Text>
            </div>

            <Paper withBorder radius="md" p="xl" mih={240}>
                <Text c="dimmed">This area is ready for the feature content.</Text>
            </Paper>
        </Stack>
    )
}
