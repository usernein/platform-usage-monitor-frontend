import { useQuery } from "@tanstack/react-query"
import {
    Card,
    Group,
    Progress,
    SimpleGrid,
    Stack,
    Text,
    ThemeIcon,
    Title,
} from "@mantine/core"
import { ArrowRight, Building2, GraduationCap, Layers3, Target } from "lucide-react"
import { Link } from "react-router-dom"
import { getInstitutions } from "../api/mockApi"
import { EmptyState, PageError, PageLoader } from "../components/PageState"
import { ScoreRing } from "../components/ScoreRing"
import { numberFormatter } from "../utils/usage"
import classes from "./styles/HomePage.module.css"

export function HomePage() {
    const institutionsQuery = useQuery({
        queryKey: ["institutions"],
        queryFn: getInstitutions,
    })

    if (institutionsQuery.isPending) {
        return <PageLoader label="Carregando suas instituições..." />
    }

    if (institutionsQuery.isError) {
        return (
            <PageError
                message={institutionsQuery.error.message}
                onRetry={() => void institutionsQuery.refetch()}
            />
        )
    }

    if (institutionsQuery.data.length === 0) {
        return <EmptyState message="Você ainda não possui acesso a nenhuma instituição." />
    }

    return (
        <Stack gap="xl" className={classes.page}>
            <div>
                <Group justify="space-between" mb="md">
                    <div>
                        <Title order={2} size="h3">
                            Suas instituições
                        </Title>
                        <Text c="dimmed" size="sm">
                            Selecione uma instituição para abrir o dashboard de indicadores.
                        </Text>
                    </div>
                </Group>

                <SimpleGrid cols={{ base: 1, sm: 2, xl: 4 }} spacing="lg">
                    {institutionsQuery.data.map((institution) => (
                        <Card
                            key={institution.id}
                            component={Link}
                            to={`/institutions/${institution.id}`}
                            className={classes.institutionCard}
                            withBorder
                            radius="lg"
                            p="lg"
                        >
                            <Group justify="space-between" align="center" wrap="nowrap">
                                <ThemeIcon size={42} radius="md" color="indigo" variant="light">
                                    <Building2 size={22} />
                                </ThemeIcon>

                                <Title order={3} size="h3" lineClamp={2} w={"100%"}>
                                    {institution.name}
                                </Title>

                                <ScoreRing
                                    score={institution.score}
                                    size={86}
                                    thickness={8}
                                    goalsMeeting={institution.goalsMeeting}
                                    totalGoals={institution.totalGoals}
                                />
                            </Group>


                            <Text size="sm" c="dimmed">
                                Score geral de metas
                            </Text>

                            <Progress
                                value={institution.score}
                                color={institution.score >= 85 ? "teal" : institution.score >= 70 ? "indigo" : "yellow"}
                                radius="xl"
                                size="sm"
                                mt="4"
                            />

                            <SimpleGrid cols={3} spacing="xs" mt="lg">
                                <Stack gap={0} align="center">
                                    <GraduationCap size={20} color="var(--mantine-color-gray-6)" />
                                    <Text fw={700} size="sm" mt={5}>
                                        {numberFormatter.format(institution.eligibleUsers)}
                                    </Text>
                                    <Text size="sm" c="dimmed" lh={"normal"}>
                                        usuários
                                    </Text>
                                </Stack>
                                <Stack gap={0} align="center">
                                    <Layers3 size={20} color="var(--mantine-color-gray-6)" />
                                    <Text fw={700} size="sm" mt={5}>
                                        {institution.applications.length}
                                    </Text>
                                    <Text size="sm" c="dimmed" lh={"normal"}>
                                        aplicações
                                    </Text>
                                </Stack>
                                <Stack gap={0} align="center">
                                    <Target size={20} color="var(--mantine-color-gray-6)" />
                                    <Text fw={700} size="sm" mt={5}>
                                        {institution.goalsMeeting}/{institution.totalGoals}
                                    </Text>
                                    <Text size="sm" c="dimmed" lh={"normal"}>
                                        metas
                                    </Text>
                                </Stack>
                            </SimpleGrid>

                            <Group className={classes.openDashboard} justify="space-between" mt="lg">
                                <Text size="sm" fw={600} c="indigo">
                                    Abrir visão geral
                                </Text>
                                <ArrowRight size={18} />
                            </Group>
                        </Card>
                    ))}
                </SimpleGrid>
            </div>
        </Stack>
    )
}
