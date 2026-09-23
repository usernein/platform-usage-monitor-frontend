import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
    ActionIcon,
    Alert,
    Anchor,
    Button,
    Divider,
    Group,
    Modal,
    MultiSelect,
    NumberInput,
    Paper,
    Select,
    SimpleGrid,
    Stack,
    Text,
    ThemeIcon,
    Title,
    Tooltip,
} from "@mantine/core"
import { useDisclosure, useMediaQuery } from "@mantine/hooks"
import {
    ArrowLeft,
    CalendarClock,
    Edit3,
    Info,
    Layers3,
    Plus,
    School,
    Target,
    UsersRound,
} from "lucide-react"
import { Link, useParams } from "react-router-dom"
import {
    getApplicationName,
    getInstitutionStudents,
    getInstitutionEducators,
    getInstitutionUsagePlans,
    getInstitutions,
} from "../api/mockApi"
import { AppBadge } from "../components/AppBadge"
import { EmptyState, PageError, PageLoader } from "../components/PageState"
import { ProfileBadge } from "../components/ProfileBadge"
import { USER_PROFILE_OPTIONS } from "../constants/userProfiles"
import type {
    GoalFrequency,
    UsagePlan,
    UserProfile,
} from "../types/domain"
import classes from "./styles/UsagePlansPage.module.css"

interface PlanForm {
    applicationId: string
    profile: UserProfile
    frequency: GoalFrequency
    minimumAccesses: number
    classNames: string[]
    userIds: string[]
}

const emptyForm: PlanForm = {
    applicationId: "",
    profile: "STUDENT",
    frequency: "WEEKLY",
    minimumAccesses: 2,
    classNames: [],
    userIds: [],
}

const frequencyLabels: Record<GoalFrequency, string> = {
    DAILY: "Diária",
    WEEKLY: "Semanal",
    MONTHLY: "Mensal",
}

const frequencyUnitLabels: Record<GoalFrequency, string> = {
    DAILY: "dia",
    WEEKLY: "semana",
    MONTHLY: "mês",
}

export function InstitutionUsagePlansPage() {
    const { institutionId = "" } = useParams()
    const smallScreen = useMediaQuery("(max-width: 48em)")
    const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false)
    const [plans, setPlans] = useState<UsagePlan[] | null>(null)
    const [editingPlanId, setEditingPlanId] = useState<string | null>(null)
    const [form, setForm] = useState<PlanForm>(emptyForm)
    const [formError, setFormError] = useState<string | null>(null)

    const institutionsQuery = useQuery({
        queryKey: ["institutions"],
        queryFn: getInstitutions,
    })
    const studentsQuery = useQuery({
        queryKey: ["institution-students", institutionId, "all"],
        queryFn: () => getInstitutionStudents(institutionId),
        enabled: Boolean(institutionId),
    })
    const educatorsQuery = useQuery({
        queryKey: ["institution-educators", institutionId],
        queryFn: () => getInstitutionEducators(institutionId),
        enabled: Boolean(institutionId),
    })
    const plansQuery = useQuery({
        queryKey: ["institution-usage-plans", institutionId],
        queryFn: () => getInstitutionUsagePlans(institutionId),
        enabled: Boolean(institutionId),
    })

    useEffect(() => {
        if (plans === null && plansQuery.data) {
            setPlans(plansQuery.data)
        }
    }, [plans, plansQuery.data])

    const institution = institutionsQuery.data?.find(({ id }) => id === institutionId)
    const classOptions = useMemo(() => {
        const classNames = new Set<string>()
        studentsQuery.data?.forEach((student) => {
            student.memberships
                .filter((membership) => membership.institutionId === institutionId)
                .forEach((membership) => classNames.add(membership.className))
        })
        return [...classNames]
            .sort((a, b) => a.localeCompare(b, "pt-BR"))
            .map((className) => ({ value: className, label: `Turma ${className}` }))
    }, [institutionId, studentsQuery.data])
    const studentOptions =
        studentsQuery.data?.map(({ id, name, memberships }) => {
            const className = memberships.find(
                (membership) => membership.institutionId === institutionId,
            )?.className
            return {
                value: id,
                label: className ? `${name} - ${className}` : name,
            }
        }) ?? []
    const educatorOptions =
        educatorsQuery.data
            ?.filter(({ profile }) => profile === form.profile)
            .map(({ id, name }) => ({ value: id, label: name })) ?? []
    const userNames = new Map([
        ...(studentsQuery.data?.map(({ id, name, memberships }) => {
            const className = memberships.find(
                (membership) => membership.institutionId === institutionId,
            )?.className
            return [id, className ? `${name} - ${className}` : name] as const
        }) ?? []),
        ...(educatorsQuery.data?.map(({ id, name }) => [id, name] as const) ?? []),
    ])

    if (
        institutionsQuery.isPending ||
        studentsQuery.isPending ||
        educatorsQuery.isPending ||
        plansQuery.isPending
    ) {
        return <PageLoader label="Carregando metas de utilização..." />
    }

    if (
        institutionsQuery.isError ||
        studentsQuery.isError ||
        educatorsQuery.isError ||
        plansQuery.isError ||
        !institution
    ) {
        const error =
            institutionsQuery.error ??
            studentsQuery.error ??
            educatorsQuery.error ??
            plansQuery.error
        return (
            <PageError
                message={error?.message ?? "Instituição não encontrada"}
                onRetry={() => {
                    void institutionsQuery.refetch()
                    void studentsQuery.refetch()
                    void educatorsQuery.refetch()
                    void plansQuery.refetch()
                }}
            />
        )
    }

    function openCreatePlan() {
        setEditingPlanId(null)
        setForm({
            ...emptyForm,
            applicationId: institution?.applications[0]?.id ?? "",
        })
        setFormError(null)
        openModal()
    }

    function openEditPlan(plan: UsagePlan) {
        setEditingPlanId(plan.id)
        setForm({
            applicationId: plan.applicationId,
            profile: plan.profile,
            frequency: plan.frequency,
            minimumAccesses: plan.minimumAccesses,
            classNames: [...plan.classNames],
            userIds: [...plan.userIds],
        })
        setFormError(null)
        openModal()
    }

    function savePlan() {
        if (!form.applicationId) {
            setFormError("Selecione uma aplicação para a meta.")
            return
        }
        if (form.minimumAccesses < 1) {
            setFormError("O mínimo de acessos deve ser maior que zero.")
            return
        }

        const plan: UsagePlan = {
            id: editingPlanId ?? `mock-plan-${Date.now()}`,
            institutionId,
            ...form,
            updatedAt: new Date().toISOString(),
        }

        setPlans((currentPlans) => {
            const existingPlans = currentPlans ?? []
            return editingPlanId
                ? existingPlans.map((currentPlan) =>
                      currentPlan.id === editingPlanId ? plan : currentPlan,
                  )
                : [plan, ...existingPlans]
        })
        closeModal()
    }

    const visiblePlans = plans ?? plansQuery.data

    return (
        <Stack gap="xl" className={classes.page}>
            <Group justify="space-between" align="flex-end">
                <div>
                    <Anchor component={Link} to={`/institutions/${institutionId}`} size="sm" c="dimmed">
                        <Group gap={6}>
                            <ArrowLeft size={15} /> Voltar ao dashboard
                        </Group>
                    </Anchor>
                    <Title order={1} mt="xs">
                        Metas de utilização
                    </Title>
                    <Text c="dimmed">
                        {institution.name} · configure metas por aplicação, perfil e público específico.
                    </Text>
                </div>
                <Button leftSection={<Plus size={18} />} onClick={openCreatePlan}>
                    Nova meta
                </Button>
            </Group>

            <Paper withBorder radius="md" p="md" className={classes.explanation}>
                <Group gap="sm" wrap="nowrap" align="flex-start">
                    <ThemeIcon color="indigo" variant="light" radius="xl">
                        <Info size={17} />
                    </ThemeIcon>
                    <div>
                        <Text fw={600} size="sm">
                            Como funciona o escopo
                        </Text>
                        <Text size="sm" c="dimmed">
                            Para alunos, turmas e pessoas podem ser combinadas. Para educadores,
                            selecione professores ou gestores específicos. Sem um escopo específico,
                            a meta vale para todo o perfil selecionado.
                        </Text>
                    </div>
                </Group>
            </Paper>

            {visiblePlans.length === 0 ? (
                <Paper withBorder radius="md">
                    <EmptyState message="Nenhuma meta configurada para esta instituição." />
                </Paper>
            ) : (
                <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
                    {visiblePlans.map((plan) => (
                        <Paper
                            key={plan.id}
                            withBorder
                            radius="lg"
                            p="lg"
                            className={classes.planCard}
                        >
                            <Group justify="space-between" align="flex-start" wrap="nowrap">
                                <Group gap="sm" wrap="nowrap">
                                    <ThemeIcon size={44} radius="md" color="indigo" variant="light">
                                        <Target size={22} />
                                    </ThemeIcon>
                                    <div>
                                        <Title order={2} size="h4">
                                            {getApplicationName(plan.applicationId)}
                                        </Title>
                                        <Group gap={6} mt={5}>
                                            <ProfileBadge profile={plan.profile} plural />
                                            <AppBadge tone="neutral">
                                                {frequencyLabels[plan.frequency]}
                                            </AppBadge>
                                        </Group>
                                    </div>
                                </Group>
                                <Tooltip label="Editar meta">
                                    <ActionIcon
                                        variant="subtle"
                                        color="gray"
                                        onClick={() => openEditPlan(plan)}
                                        aria-label={`Editar meta de ${getApplicationName(plan.applicationId)}`}
                                    >
                                        <Edit3 size={18} />
                                    </ActionIcon>
                                </Tooltip>
                            </Group>

                            <Group mt="xl" gap="xl">
                                <Group gap={8}>
                                    <CalendarClock size={18} color="var(--mantine-color-gray-6)" />
                                    <div>
                                        <Text size="xs" c="dimmed">
                                            Mínimo de acessos
                                        </Text>
                                        <Text fw={700}>
                                            {plan.minimumAccesses} por {frequencyUnitLabels[plan.frequency]}
                                        </Text>
                                    </div>
                                </Group>
                                <Group gap={8}>
                                    <Layers3 size={18} color="var(--mantine-color-gray-6)" />
                                    <div>
                                        <Text size="xs" c="dimmed">
                                            Escopo
                                        </Text>
                                        <Text fw={700}>
                                            {plan.classNames.length + plan.userIds.length > 0
                                                ? `${plan.classNames.length + plan.userIds.length} seleções`
                                                : "Todo o perfil"}
                                        </Text>
                                    </div>
                                </Group>
                            </Group>

                            <Divider my="md" />

                            <Stack gap="sm">
                                {plan.profile === "STUDENT" && (
                                    <Group gap="sm" align="flex-start" wrap="nowrap">
                                        <School size={17} />
                                        <div>
                                            <Text size="xs" c="dimmed">
                                                Turmas específicas
                                            </Text>
                                            <Text size="sm">
                                                {plan.classNames.length > 0
                                                    ? plan.classNames
                                                          .map((name) => `Turma ${name}`)
                                                          .join(", ")
                                                    : "Todas as turmas do perfil"}
                                            </Text>
                                        </div>
                                    </Group>
                                )}
                                <Group gap="sm" align="flex-start" wrap="nowrap">
                                    <UsersRound size={17} />
                                    <div>
                                        <Text size="xs" c="dimmed">
                                            {plan.profile === "STUDENT"
                                                ? "Alunos incluídos individualmente"
                                                : plan.profile === "TEACHER"
                                                  ? "Professores incluídos individualmente"
                                                  : "Gestores incluídos individualmente"}
                                        </Text>
                                        <Text size="sm" lineClamp={2}>
                                            {plan.userIds.length > 0
                                                ? plan.userIds
                                                      .map((id) => userNames.get(id) ?? id)
                                                      .join(", ")
                                                : plan.profile === "STUDENT"
                                                  ? "Nenhum aluno específico"
                                                  : plan.profile === "TEACHER"
                                                    ? "Nenhum professor específico"
                                                    : "Nenhum gestor específico"}
                                        </Text>
                                    </div>
                                </Group>
                            </Stack>
                        </Paper>
                    ))}
                </SimpleGrid>
            )}

            <Modal
                opened={modalOpened}
                onClose={closeModal}
                title={editingPlanId ? "Editar meta" : "Nova meta"}
                size="lg"
                fullScreen={smallScreen}
                centered
            >
                <Stack gap="md">
                    {formError && (
                        <Alert color="red" title="Revise os dados">
                            {formError}
                        </Alert>
                    )}

                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                        <Select
                            label="Aplicação"
                            placeholder="Selecione a aplicação"
                            data={institution.applications.map(({ id, name }) => ({
                                value: id,
                                label: name,
                            }))}
                            value={form.applicationId}
                            onChange={(value) =>
                                setForm((current) => ({
                                    ...current,
                                    applicationId: value ?? "",
                                }))
                            }
                            required
                        />
                        <Select
                            label="Perfil"
                            data={USER_PROFILE_OPTIONS}
                            value={form.profile}
                            onChange={(value) =>
                                setForm((current) => ({
                                    ...current,
                                    profile: (value ?? "STUDENT") as UserProfile,
                                    classNames: [],
                                    userIds: [],
                                }))
                            }
                            allowDeselect={false}
                        />
                        <Select
                            label="Frequência"
                            data={[
                                { value: "DAILY", label: "Diária" },
                                { value: "WEEKLY", label: "Semanal" },
                                { value: "MONTHLY", label: "Mensal" },
                            ]}
                            value={form.frequency}
                            onChange={(value) =>
                                setForm((current) => ({
                                    ...current,
                                    frequency: (value ?? "WEEKLY") as GoalFrequency,
                                }))
                            }
                            allowDeselect={false}
                        />
                        <NumberInput
                            label="Mínimo de acessos"
                            value={form.minimumAccesses}
                            onChange={(value) =>
                                setForm((current) => ({
                                    ...current,
                                    minimumAccesses: typeof value === "number" ? value : 1,
                                }))
                            }
                            min={1}
                            max={100}
                            required
                        />
                    </SimpleGrid>

                    <Divider label="Escopo específico (opcional)" labelPosition="center" />

                    {form.profile === "STUDENT" && (
                        <MultiSelect
                            label="Turmas específicas"
                            description="Selecione uma ou mais turmas elegíveis."
                            placeholder="Buscar e selecionar turmas"
                            data={classOptions}
                            value={form.classNames}
                            onChange={(classNames) =>
                                setForm((current) => ({ ...current, classNames }))
                            }
                            searchable
                            clearable
                            hidePickedOptions
                            nothingFoundMessage="Nenhuma turma encontrada"
                        />
                    )}
                    <MultiSelect
                        label={
                            form.profile === "STUDENT"
                                ? "Alunos específicos"
                                : form.profile === "TEACHER"
                                  ? "Professores específicos"
                                  : "Gestores específicos"
                        }
                        description={
                            form.profile === "STUDENT"
                                ? "Inclua alunos individualmente, além das turmas selecionadas."
                                : form.profile === "TEACHER"
                                  ? "Selecione os professores elegíveis para esta meta."
                                  : "Selecione os gestores elegíveis para esta meta."
                        }
                        placeholder={
                            form.profile === "STUDENT"
                                ? "Buscar aluno por nome"
                                : form.profile === "TEACHER"
                                  ? "Buscar professor por nome"
                                  : "Buscar gestor por nome"
                        }
                        data={form.profile === "STUDENT" ? studentOptions : educatorOptions}
                        value={form.userIds}
                        onChange={(userIds) =>
                            setForm((current) => ({ ...current, userIds }))
                        }
                        searchable
                        clearable
                        hidePickedOptions
                        nothingFoundMessage={
                            form.profile === "STUDENT"
                                ? "Nenhum aluno encontrado"
                                : form.profile === "TEACHER"
                                  ? "Nenhum professor encontrado"
                                  : "Nenhum gestor encontrado"
                        }
                        limit={10}
                    />

                    <Group justify="flex-end" mt="sm">
                        <Button variant="default" onClick={closeModal}>
                            Cancelar
                        </Button>
                        <Button onClick={savePlan}>
                            {editingPlanId ? "Salvar alterações" : "Adicionar meta"}
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </Stack>
    )
}
