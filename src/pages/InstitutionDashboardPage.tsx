import { lazy, useEffect, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { AreaChart, BarChart } from "@mantine/charts"
import { useMediaQuery } from "@mantine/hooks"
import dayjs from "dayjs"
import "dayjs/locale/pt-br"
import {
    Anchor,
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
    CalendarDays,
    CircleAlert,
    CircleCheck,
    CircleX,
    Layers3,
    ListChecks,
    ShieldCheck,
    Target,
    Users,
} from "lucide-react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { getInstitutionDashboard, getInstitutions } from "../api/mockApi"
import { AppBadge } from "../components/AppBadge"
import { MetricCard } from "../components/MetricCard"
import { EmptyState, PageError, PageLoader } from "../components/PageState"
import { ScoreRing } from "../components/ScoreRing"
import { numberFormatter } from "../utils/usage"
import classes from "./styles/DashboardPage.module.css"

const DatePickerInput = lazy(() =>
    import("@mantine/dates").then((module) => ({ default: module.DatePickerInput })),
)

type DateRange = [string | null, string | null]
type CompleteDateRange = [string, string]

const today = dayjs()
const defaultDateRange: CompleteDateRange = [
    today.subtract(29, "day").format("YYYY-MM-DD"),
    today.format("YYYY-MM-DD"),
]
const datePresets: { value: CompleteDateRange; label: string }[] = [
    {
        value: [today.subtract(6, "day").format("YYYY-MM-DD"), today.format("YYYY-MM-DD")],
        label: "Últimos 7 dias",
    },
    {
        value: defaultDateRange,
        label: "Últimos 30 dias",
    },
    {
        value: [today.subtract(89, "day").format("YYYY-MM-DD"), today.format("YYYY-MM-DD")],
        label: "Últimos 90 dias",
    },
    {
        value: [today.subtract(6, "month").format("YYYY-MM-DD"), today.format("YYYY-MM-DD")],
        label: "Últimos 6 meses",
    },
    {
        value: [today.subtract(1, "year").format("YYYY-MM-DD"), today.format("YYYY-MM-DD")],
        label: "Último ano",
    },
]

export function InstitutionDashboardPage() {
    const { institutionId = "" } = useParams()
    const navigate = useNavigate()
    const smallScreen = useMediaQuery("(max-width: 48em)")
    const [applicationId, setApplicationId] = useState("all")
    const [dateRange, setDateRange] = useState<DateRange>(defaultDateRange)
    const [appliedDateRange, setAppliedDateRange] =
        useState<CompleteDateRange>(defaultDateRange)
    const [filtersStuck, setFiltersStuck] = useState(false)
    const filtersRef = useRef<HTMLDivElement>(null)

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

    useEffect(() => {
        const filters = filtersRef.current
        if (!filters || smallScreen) {
            setFiltersStuck(false)
            return
        }

        const updateStickyState = () => {
            setFiltersStuck(filters.getBoundingClientRect().top <= 60 && window.scrollY > 0)
        }
        updateStickyState()
        window.addEventListener("scroll", updateStickyState, { passive: true })
        window.addEventListener("resize", updateStickyState)

        return () => {
            window.removeEventListener("scroll", updateStickyState)
            window.removeEventListener("resize", updateStickyState)
        }
    }, [smallScreen])

    const dashboardQuery = useQuery({
        queryKey: [
            "institution-dashboard",
            institutionId,
            applicationId,
            appliedDateRange[0],
            appliedDateRange[1],
        ],
        queryFn: () =>
            getInstitutionDashboard(institutionId, {
                applicationId,
                startDate: appliedDateRange[0],
                endDate: appliedDateRange[1],
            }),
        enabled: Boolean(institutionId),
    })

    function handleDateRangeChange(value: DateRange) {
        setDateRange(value)
        if (value[0] && value[1]) {
            setAppliedDateRange([value[0], value[1]])
        }
    }

    if (institutionsQuery.isPending || dashboardQuery.isPending) {
        return <PageLoader label="Organizando informações..." />
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
                        <AppBadge tone="success">
                            Dados atualizados
                        </AppBadge>
                    </Group>
                    <Text c="dimmed" mt={4}>
                        Indicadores de adesão e utilização das aplicações educacionais.
                    </Text>
                </div>

                <Group wrap="nowrap" className={classes.headerScore}>
                    <ScoreRing
                        score={dashboard.institution.score}
                        size={82}
                        thickness={8}
                        goalsMeeting={dashboard.institution.goalsMeeting}
                        totalGoals={dashboard.institution.totalGoals}
                        activeRate={summary.activeUserRate}
                        trend={summary.adherenceTrend}
                    />
                    <div>
                        <Text size="xs" c="dimmed">
                            Score geral
                        </Text>
                        <Text fw={700}>Desempenho em metas de acesso</Text>
                    </div>
                </Group>
            </Group>

            <Paper
                ref={filtersRef}
                withBorder
                radius="md"
                p="md"
                className={classes.filters}
                data-stuck={filtersStuck || undefined}
            >
                <Group align="flex-end" className={classes.filterFields}>
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
                    <DatePickerInput
                        type="range"
                        label="Período"
                        placeholder="Selecione o período"
                        value={dateRange}
                        onChange={(value) => {
                            if (Array.isArray(value)) {
                                handleDateRangeChange([
                                    typeof value[0] === "string" ? value[0] : null,
                                    typeof value[1] === "string" ? value[1] : null,
                                ])
                            }
                        }}
                        presets={datePresets}
                        locale="pt-br"
                        valueFormat="DD MMM YYYY"
                        leftSection={<CalendarDays size={17} />}
                        leftSectionPointerEvents="none"
                        maxDate={today.toDate()}
                        minDate={today.subtract(1, "year").toDate()}
                        numberOfColumns={smallScreen ? 1 : 2}
                        dropdownType={smallScreen ? "modal" : "popover"}
                        w={{ base: "100%", sm: 270 }}
                    />
                    <Group ml={{ sm: "auto" }} gap="sm">
                        <Button
                            component={Link}
                            to={`/institutions/${institutionId}/usage-plans`}
                            leftSection={<ListChecks size={17} />}
                            variant="light"
                        >
                            Gerenciar metas
                        </Button>
                        <Button
                            component={Link}
                            to={`/institutions/${institutionId}/users?application=${applicationId}`}
                            leftSection={<Users size={17} />}
                        >
                            Ver usuários
                        </Button>
                    </Group>
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
                    to={`/institutions/${institutionId}/users?application=${applicationId}&status=MET`}
                />
                <MetricCard
                    label="Não atingiram"
                    value={numberFormatter.format(summary.usersNotMeetingGoal)}
                    description="Precisam de acompanhamento"
                    icon={<CircleX size={21} />}
                    color="red"
                    to={`/institutions/${institutionId}/users?application=${applicationId}&status=BELOW_GOAL`}
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
                    to={`/institutions/${institutionId}/users?application=${applicationId}&status=ACTIVE`}
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
                    to={`/institutions/${institutionId}/users?application=${applicationId}&status=AT_RISK`}
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
                            <AppBadge tone="info" appearance="dot">
                                Acessos
                            </AppBadge>
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
                            Comparação entre alunos e educadores
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
