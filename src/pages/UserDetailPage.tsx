import { useQuery } from "@tanstack/react-query"
import {
    Anchor,
    Avatar,
    Badge,
    Divider,
    Group,
    Paper,
    Progress,
    SimpleGrid,
    Stack,
    Text,
    ThemeIcon,
    Title,
} from "@mantine/core"
import { ArrowLeft, Building2, CalendarDays, Mail, School, Target } from "lucide-react"
import { Link, useParams, useSearchParams } from "react-router-dom"
import { getApplicationName, getInstitutions, getStudent } from "../api/mockApi"
import { GoalStatusBadge } from "../components/GoalStatusBadge"
import { PageError, PageLoader } from "../components/PageState"
import { formatDate } from "../utils/usage"
import classes from "./styles/UserDetailPage.module.css"

const frequencyLabels = {
    DAILY: "Diária",
    WEEKLY: "Semanal",
    MONTHLY: "Mensal",
}

export function UserDetailPage() {
    const { userId = "" } = useParams()
    const [searchParams] = useSearchParams()
    const sourceInstitutionId = searchParams.get("institution")

    const studentQuery = useQuery({
        queryKey: ["student", userId],
        queryFn: () => getStudent(userId),
        enabled: Boolean(userId),
    })
    const institutionsQuery = useQuery({
        queryKey: ["institutions"],
        queryFn: getInstitutions,
    })

    if (studentQuery.isPending || institutionsQuery.isPending) {
        return <PageLoader label="Carregando detalhes do aluno..." />
    }

    if (studentQuery.isError || institutionsQuery.isError) {
        const error = studentQuery.error ?? institutionsQuery.error
        return (
            <PageError
                message={error?.message}
                onRetry={() => {
                    void studentQuery.refetch()
                    void institutionsQuery.refetch()
                }}
            />
        )
    }

    const student = studentQuery.data
    const initials = student.name
        .split(" ")
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
    const totalGoals = student.memberships.reduce(
        (total, membership) => total + membership.goals.length,
        0,
    )
    const goalsMet = student.memberships.reduce(
        (total, membership) =>
            total + membership.goals.filter(({ status }) => status === "MET").length,
        0,
    )
    const goalProgress = totalGoals === 0 ? 0 : Math.round((goalsMet / totalGoals) * 100)
    const backTo = sourceInstitutionId
        ? `/institutions/${sourceInstitutionId}/users`
        : "/"

    return (
        <Stack gap="xl" className={classes.page}>
            <Anchor component={Link} to={backTo} size="sm" c="dimmed">
                <Group gap={6}>
                    <ArrowLeft size={15} /> Voltar para alunos
                </Group>
            </Anchor>

            <Paper withBorder radius="lg" p={{ base: "lg", sm: "xl" }}>
                <Group justify="space-between" align="flex-start">
                    <Group gap="lg">
                        <Avatar size={72} radius="xl" color="indigo" fz="xl">
                            {initials}
                        </Avatar>
                        <div>
                            <Group gap="sm">
                                <Title order={1}>{student.name}</Title>
                                <Badge color="indigo" variant="light">
                                    Aluno
                                </Badge>
                            </Group>
                            <Group gap={6} mt={6} c="dimmed">
                                <Mail size={16} />
                                <Text size="sm">{student.email}</Text>
                            </Group>
                            <Group gap={6} mt={4} c="dimmed">
                                <Building2 size={16} />
                                <Text size="sm">
                                    {student.memberships.length} instituição(ões)
                                </Text>
                            </Group>
                        </div>
                    </Group>

                    <Stack gap={4} className={classes.summary}>
                        <Text size="sm" c="dimmed">
                            Progresso geral das metas
                        </Text>
                        <Group justify="space-between">
                            <Text fw={700} fz="xl">
                                {goalProgress}%
                            </Text>
                            <Text size="sm" c="dimmed">
                                {goalsMet} de {totalGoals}
                            </Text>
                        </Group>
                        <Progress value={goalProgress} color="indigo" radius="xl" size="lg" />
                    </Stack>
                </Group>
            </Paper>

            <div>
                <Title order={2} size="h3" mb={4}>
                    Instituições e metas aplicáveis
                </Title>
                <Text c="dimmed" size="sm">
                    Uma meta só aparece quando o aluno pertence ao perfil ou à turma elegível.
                </Text>
            </div>

            <Stack gap="lg">
                {student.memberships.map((membership) => {
                    const institution = institutionsQuery.data.find(
                        ({ id }) => id === membership.institutionId,
                    )

                    return (
                        <Paper key={membership.institutionId} withBorder radius="lg" p="lg">
                            <Group justify="space-between" mb="lg">
                                <Group gap="sm">
                                    <ThemeIcon color="indigo" variant="light" size={42} radius="md">
                                        <School size={21} />
                                    </ThemeIcon>
                                    <div>
                                        <Title order={3} size="h4">
                                            {institution?.name ?? membership.institutionId}
                                        </Title>
                                        <Text size="sm" c="dimmed">
                                            Turma {membership.className} · matriculado desde{" "}
                                            {formatDate(membership.enrolledAt)}
                                        </Text>
                                    </div>
                                </Group>
                                <Badge variant="outline">
                                    {membership.goals.length} metas aplicáveis
                                </Badge>
                            </Group>

                            <Divider mb="lg" />

                            <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }} spacing="md">
                                {membership.goals.map((goal) => {
                                    const progress = Math.min(
                                        100,
                                        Math.round(
                                            (goal.accessCount / goal.minimumAccesses) * 100,
                                        ),
                                    )

                                    return (
                                        <Paper
                                            key={`${membership.institutionId}-${goal.applicationId}`}
                                            withBorder
                                            radius="md"
                                            p="md"
                                            className={classes.goalCard}
                                        >
                                            <Group justify="space-between" align="flex-start">
                                                <div>
                                                    <Text fw={700}>
                                                        {getApplicationName(goal.applicationId)}
                                                    </Text>
                                                    <Text size="xs" c="dimmed">
                                                        Meta {frequencyLabels[goal.frequency]}
                                                    </Text>
                                                </div>
                                                <GoalStatusBadge status={goal.status} />
                                            </Group>

                                            <Group justify="space-between" mt="lg" mb={6}>
                                                <Text size="sm">Acessos no período</Text>
                                                <Text fw={700}>
                                                    {goal.accessCount} / {goal.minimumAccesses}
                                                </Text>
                                            </Group>
                                            <Progress
                                                value={progress}
                                                color={
                                                    goal.status === "MET"
                                                        ? "teal"
                                                        : goal.status === "AT_RISK"
                                                          ? "yellow"
                                                          : "red"
                                                }
                                                radius="xl"
                                            />

                                            <Stack gap={6} mt="lg">
                                                <Group gap={7} wrap="nowrap">
                                                    <Target size={15} />
                                                    <Text size="xs" c="dimmed">
                                                        Elegibilidade: {goal.targetAudience}
                                                    </Text>
                                                </Group>
                                                <Group gap={7} wrap="nowrap">
                                                    <CalendarDays size={15} />
                                                    <Text size="xs" c="dimmed">
                                                        Último acesso: {formatDate(goal.lastAccessAt)}
                                                    </Text>
                                                </Group>
                                            </Stack>
                                        </Paper>
                                    )
                                })}
                            </SimpleGrid>
                        </Paper>
                    )
                })}
            </Stack>
        </Stack>
    )
}
