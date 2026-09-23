import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { AreaChart, BarChart } from "@mantine/charts"
import {
    Anchor,
    Badge,
    Button,
    Grid,
    Group,
    Paper,
    Progress,
    Select,
    SimpleGrid,
    Stack,
    Text,
    Title,
} from "@mantine/core"
import {
    Activity,
    ArrowLeft,
    ArrowUpRight,
    CircleAlert,
    CircleCheck,
    CircleX,
    Layers3,
    ShieldCheck,
    Target,
    Users,
} from "lucide-react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { getInstitutionDashboard, getInstitutions } from "../api/mockApi"
import { MetricCard } from "../components/MetricCard"
import { EmptyState, PageError, PageLoader } from "../components/PageState"
import { ScoreRing } from "../components/ScoreRing"
import type { DashboardPeriod } from "../types/domain"
import { numberFormatter } from "../utils/usage"
import classes from "./styles/DashboardPage.module.css"

const periodOptions = [
    { value: "7d", label: "Últimos 7 dias" },
    { value: "30d", label: "Últimos 30 dias" },
    { value: "90d", label: "Últimos 90 dias" },
]

export function InstitutionDashboardPage() {
    const { institutionId = "" } = useParams()
    const navigate = useNavigate()
    const [applicationId, setApplicationId] = useState("all")
    const [period, setPeriod] = useState<DashboardPeriod>("30d")

    const institutionsQuery = useQuery({
        queryKey: ["institutions"],
        queryFn: getInstitutions,
    })
    const currentInstitution = institutionsQuery.data?.find(
        ({ id }) => id === institutionId,
    )

    useEffect(() => {
        setApplicationId("all")
    }, [institutionId])

    const dashboardQuery = useQuery({
        queryKey: ["institution-dashboard", institutionId, applicationId, period],
        queryFn: () =>
            getInstitutionDashboard(institutionId, { applicationId, period }),
        enabled: Boolean(institutionId),
    })

    if (institutionsQuery.isPending || dashboardQuery.isPending) {
        return <PageLoader label="Montando o dashboard..." />
    }

    if (institutionsQuery.isError || dashboardQuery.isError) {
        const error = institutionsQuery.error ?? dashboardQuery.error
        return (
            <PageError
                message={error?.message}
                onRetry={() => {
                    void institutionsQuery.refetch()
                    void dashboardQuery.refetch()
                }}
            />
        )
    }

    const dashboard = dashboardQuery.data
    const { summary } = dashboard
    const applicationOptions = [
        { value: "all", label: "Todas as aplicações" },
        ...(currentInstitution?.applications.map(({ id, name }) => ({
            value: id,
            label: name,
        })) ?? []),
    ]

    return (
        <Stack gap="xl" className={classes.page}>
            <Group justify="space-between" align="flex-start">
                <div>
                    <Anchor component={Link} to="/" size="sm" c="dimmed">
                        <Group gap={6}>
                            <ArrowLeft size={15} /> Instituições
                        </Group>
                    </Anchor>
                    <Group gap="md" mt="xs" align="center">
                        <Title order={1}>{dashboard.institution.name}</Title>
                        <Badge color="teal" variant="light">
                            Dados atualizados
                        </Badge>
                    </Group>
                    <Text c="dimmed" mt={4}>
                        Indicadores de adesão e utilização das aplicações educacionais.
                    </Text>
                </div>

                <Group wrap="nowrap" className={classes.headerScore}>
                    <ScoreRing score={dashboard.institution.score} size={82} thickness={8} />
                    <div>
                        <Text size="xs" c="dimmed">
                            Score geral
                        </Text>
                        <Text fw={700}>Saúde da instituição</Text>
                    </div>
                </Group>
            </Group>

            <Paper withBorder radius="md" p="md" className={classes.filters}>
                <Group align="flex-end">
                    <Select
                        label="Instituição"
                        data={institutionsQuery.data.map(({ id, name }) => ({
                            value: id,
                            label: name,
                        }))}
                        value={institutionId}
                        onChange={(value) => value && navigate(`/institutions/${value}`)}
                        searchable
                        allowDeselect={false}
                        w={{ base: "100%", sm: 260 }}
                    />
                    <Select
                        label="Aplicação"
                        data={applicationOptions}
                        value={applicationId}
                        onChange={(value) => setApplicationId(value ?? "all")}
                        allowDeselect={false}
                        w={{ base: "100%", sm: 230 }}
                    />
                    <Select
                        label="Período"
                        data={periodOptions}
                        value={period}
                        onChange={(value) => setPeriod((value ?? "30d") as DashboardPeriod)}
                        allowDeselect={false}
                        w={{ base: "100%", sm: 190 }}
                    />
                    <Button
                        component={Link}
                        to={`/institutions/${institutionId}/users?application=${applicationId}`}
                        leftSection={<Users size={17} />}
                        ml={{ sm: "auto" }}
                    >
                        Ver alunos
                    </Button>
                </Group>
            </Paper>

            <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="md">
                <MetricCard
                    label="Usuários elegíveis"
                    value={numberFormatter.format(summary.eligibleUsers)}
                    description="Base considerada no período"
                    icon={<Users size={21} />}
                />
                <MetricCard
                    label="Atingiram a meta"
                    value={numberFormatter.format(summary.usersMeetingGoal)}
                    description="Usuários dentro do esperado"
                    icon={<CircleCheck size={21} />}
                    color="teal"
                />
                <MetricCard
                    label="Não atingiram"
                    value={numberFormatter.format(summary.usersNotMeetingGoal)}
                    description="Precisam de acompanhamento"
                    icon={<CircleX size={21} />}
                    color="red"
                />
                <MetricCard
                    label="Adesão"
                    value={`${summary.adherenceRate}%`}
                    description="Metas atingidas no período"
                    icon={<Target size={21} />}
                    color="indigo"
                />
                <MetricCard
                    label="Usuários ativos"
                    value={`${summary.activeUserRate}%`}
                    description="Com ao menos um acesso"
                    icon={<Activity size={21} />}
                    color="cyan"
                />
                <MetricCard
                    label="Tendência de adesão"
                    value={`${summary.adherenceTrend > 0 ? "+" : ""}${summary.adherenceTrend}%`}
                    description="Comparado ao período anterior"
                    icon={<ArrowUpRight size={21} />}
                    color={summary.adherenceTrend >= 0 ? "teal" : "red"}
                />
                <MetricCard
                    label="Usuários em risco"
                    value={numberFormatter.format(summary.usersAtRisk)}
                    description="Próximos do fim do período"
                    icon={<CircleAlert size={21} />}
                    color="yellow"
                />
                <MetricCard
                    label="Cobertura de metas"
                    value={`${summary.goalCoverage}%`}
                    description="Aplicações e perfis cobertos"
                    icon={<ShieldCheck size={21} />}
                    color="grape"
                />
            </SimpleGrid>

            <Grid gap="lg">
                <Grid.Col span={{ base: 12, lg: 8 }}>
                    <Paper withBorder radius="md" p="lg" h="100%">
                        <Group justify="space-between" mb="lg">
                            <div>
                                <Title order={2} size="h4">
                                    Evolução de utilização
                                </Title>
                                <Text c="dimmed" size="sm">
                                    Volume de acessos ao longo do período selecionado
                                </Text>
                            </div>
                            <Badge variant="dot" color="indigo">
                                Acessos
                            </Badge>
                        </Group>
                        <AreaChart
                            h={310}
                            data={dashboard.evolution}
                            dataKey="period"
                            series={[{ name: "accesses", label: "Acessos", color: "indigo.6" }]}
                            curveType="monotone"
                            withGradient
                            valueFormatter={(value) => numberFormatter.format(value)}
                        />
                    </Paper>
                </Grid.Col>

                <Grid.Col span={{ base: 12, lg: 4 }}>
                    <Paper withBorder radius="md" p="lg" h="100%">
                        <Title order={2} size="h4">
                            Adoção por perfil
                        </Title>
                        <Text c="dimmed" size="sm" mb="xl">
                            Comparação entre alunos e professores
                        </Text>
                        <Stack gap="xl">
                            {dashboard.profileAdoption.map(({ profile, adherence }) => (
                                <div key={profile}>
                                    <Group justify="space-between" mb={8}>
                                        <Text fw={600}>{profile}</Text>
                                        <Text fw={700}>{adherence}%</Text>
                                    </Group>
                                    <Progress
                                        value={adherence}
                                        size="lg"
                                        radius="xl"
                                        color={profile === "Alunos" ? "indigo" : "cyan"}
                                        animated
                                    />
                                </div>
                            ))}
                        </Stack>
                        <Paper bg="var(--mantine-color-gray-light)" radius="md" p="md" mt="xl">
                            <Group gap="sm" wrap="nowrap">
                                <Layers3 size={20} />
                                <Text size="sm">
                                    {dashboard.applications.length} aplicação(ões) considerada(s)
                                    neste recorte.
                                </Text>
                            </Group>
                        </Paper>
                    </Paper>
                </Grid.Col>

                <Grid.Col span={12}>
                    <Paper withBorder radius="md" p="lg">
                        <Group justify="space-between" mb="lg">
                            <div>
                                <Title order={2} size="h4">
                                    Ranking de aplicações
                                </Title>
                                <Text c="dimmed" size="sm">
                                    Adesão às metas por aplicação
                                </Text>
                            </div>
                            <Button
                                component={Link}
                                to={`/institutions/${institutionId}/users?application=${applicationId}`}
                                variant="light"
                                size="xs"
                            >
                                Consultar usuários
                            </Button>
                        </Group>

                        {dashboard.applications.length > 0 ? (
                            <BarChart
                                h={280}
                                data={dashboard.applications}
                                dataKey="application"
                                series={[
                                    {
                                        name: "adherence",
                                        label: "Adesão (%)",
                                        color: "indigo.6",
                                    },
                                ]}
                                maxBarWidth={48}
                                valueFormatter={(value) => `${value}%`}
                            />
                        ) : (
                            <EmptyState message="Nenhuma aplicação encontrada para este filtro." />
                        )}
                    </Paper>
                </Grid.Col>
            </Grid>
        </Stack>
    )
}
