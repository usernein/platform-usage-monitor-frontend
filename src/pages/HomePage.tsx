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
import { AppBadge } from "../components/AppBadge"
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

    const averageScore = Math.round(
        institutionsQuery.data.reduce((total, institution) => total + institution.score, 0) /
            institutionsQuery.data.length,
    )
    const portfolioGoalsMeeting = institutionsQuery.data.reduce(
        (total, institution) => total + institution.goalsMeeting,
        0,
    )
    const portfolioTotalGoals = institutionsQuery.data.reduce(
        (total, institution) => total + institution.totalGoals,
        0,
    )

    return (
        <Stack gap="xl" className={classes.page}>
            <section className={classes.hero}>
                <Stack gap={6}>
                    <Text c="indigo" fw={700} size="sm">
                        VISÃO GERAL
                    </Text>
                    <Title order={1}>Olá, João Gomes</Title>
                    <Text c="dimmed" maw={680}>
                        Acompanhe a saúde de uso das instituições que você gerencia. O score
                        resume o desempenho de todas as metas configuradas por aplicação.
                    </Text>
                </Stack>

                <Group gap="lg" className={classes.portfolioScore} wrap="nowrap">
                    <ScoreRing
                        score={averageScore}
                        size={88}
                        thickness={8}
                        goalsMeeting={portfolioGoalsMeeting}
                        totalGoals={portfolioTotalGoals}
                    />
                    <div>
                        <Text size="sm" c="dimmed">
                            Score médio
                        </Text>
                        <Text fw={700}>Carteira de instituições</Text>
                        <AppBadge tone="info" mt={6}>
                            {institutionsQuery.data.length} instituições
                        </AppBadge>
                    </div>
                </Group>
            </section>

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
                            <Group justify="space-between" align="flex-start" wrap="nowrap">
                                <ThemeIcon size={42} radius="md" color="indigo" variant="light">
                                    <Building2 size={22} />
                                </ThemeIcon>
                                <ScoreRing
                                    score={institution.score}
                                    size={86}
                                    thickness={8}
                                    goalsMeeting={institution.goalsMeeting}
                                    totalGoals={institution.totalGoals}
                                />
                            </Group>

                            <Title order={3} size="h4" mt="md" lineClamp={2} mih={50}>
                                {institution.name}
                            </Title>
                            <Text size="xs" c="dimmed" mt={4}>
                                Score geral de metas
                            </Text>

                            <Progress
                                value={institution.score}
                                color={institution.score >= 85 ? "teal" : institution.score >= 70 ? "indigo" : "yellow"}
                                radius="xl"
                                size="sm"
                                mt="md"
                            />

                            <SimpleGrid cols={3} spacing="xs" mt="lg">
                                <Stack gap={2} align="center">
                                    <GraduationCap size={17} color="var(--mantine-color-gray-6)" />
                                    <Text fw={700} size="sm">
                                        {numberFormatter.format(institution.eligibleUsers)}
                                    </Text>
                                    <Text size="xs" c="dimmed">
                                        usuários
                                    </Text>
                                </Stack>
                                <Stack gap={2} align="center">
                                    <Layers3 size={17} color="var(--mantine-color-gray-6)" />
                                    <Text fw={700} size="sm">
                                        {institution.applications.length}
                                    </Text>
                                    <Text size="xs" c="dimmed">
                                        aplicações
                                    </Text>
                                </Stack>
                                <Stack gap={2} align="center">
                                    <Target size={17} color="var(--mantine-color-gray-6)" />
                                    <Text fw={700} size="sm">
                                        {institution.goalsMeeting}/{institution.totalGoals}
                                    </Text>
                                    <Text size="xs" c="dimmed">
                                        metas
                                    </Text>
                                </Stack>
                            </SimpleGrid>

                            <Group className={classes.openDashboard} justify="space-between" mt="lg">
                                <Text size="sm" fw={600} c="indigo">
                                    Ver dashboard
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
