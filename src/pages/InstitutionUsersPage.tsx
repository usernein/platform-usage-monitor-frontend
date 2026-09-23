import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
    Anchor,
    Avatar,
    Button,
    Group,
    MultiSelect,
    Paper,
    Select,
    Stack,
    Table,
    Text,
    TextInput,
    Title,
} from "@mantine/core"
import { ArrowLeft, ListChecks, Search, UserRoundSearch, X } from "lucide-react"
import { Link, useParams, useSearchParams } from "react-router-dom"
import { getInstitutionUsers, getInstitutions } from "../api/mockApi"
import { AppBadge } from "../components/AppBadge"
import { GoalStatusBadge } from "../components/GoalStatusBadge"
import { ProfileBadge } from "../components/ProfileBadge"
import { TablePagination } from "../components/TablePagination"
import { EmptyState, PageError, PageLoader } from "../components/PageState"
import type { UserProfile } from "../types/domain"
import {
    USER_PROFILE_COLORS,
    USER_PROFILE_OPTIONS,
    USER_PROFILES,
} from "../constants/userProfiles"
import { formatDate, getUserGoals } from "../utils/usage"
import {
    matchesUserStatus,
    parseUserStatus,
    USER_STATUS_OPTIONS,
} from "../utils/userListFilters"
import classes from "./styles/UsersPage.module.css"

export function InstitutionUsersPage() {
    const { institutionId = "" } = useParams()
    const [searchParams, setSearchParams] = useSearchParams()
    const [search, setSearch] = useState("")
    const applicationId = searchParams.get("application") ?? "all"
    const className = searchParams.get("class") ?? ""
    const status = parseUserStatus(searchParams.get("status"))
    const selectedProfiles = (searchParams.get("types")?.split(",") ?? []).filter(
        (profile): profile is UserProfile => USER_PROFILES.includes(profile as UserProfile),
    )
    const requestedPage = Math.max(1, Number(searchParams.get("page")) || 1)
    const requestedPageSize = Number(searchParams.get("pageSize")) || 20
    const pageSize = [20, 50, 100].includes(requestedPageSize) ? requestedPageSize : 20

    const institutionsQuery = useQuery({
        queryKey: ["institutions"],
        queryFn: getInstitutions,
    })
    const usersQuery = useQuery({
        queryKey: ["institution-users", institutionId, applicationId],
        queryFn: () => getInstitutionUsers(institutionId),
        enabled: Boolean(institutionId),
    })

    const institution = institutionsQuery.data?.find(({ id }) => id === institutionId)
    const classOptions = useMemo(() => {
        const names = new Set<string>()
        usersQuery.data
            ?.filter(({ profile }) => profile === "STUDENT")
            .forEach((user) => {
                const membership = user.memberships.find(
                    ({ institutionId: currentId }) => currentId === institutionId,
                )
                if (membership) names.add(membership.className)
            })
        return [...names]
            .sort((a, b) => a.localeCompare(b, "pt-BR"))
            .map((name) => ({ value: name, label: `Turma ${name}` }))
    }, [institutionId, usersQuery.data])

    const filteredUsers = useMemo(() => {
        const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR")

        return (usersQuery.data ?? []).filter((user) => {
            const { membership, summary } = getUserGoals(
                user,
                institutionId,
                applicationId,
            )
            const matchesSearch =
                !normalizedSearch ||
                user.name.toLocaleLowerCase("pt-BR").includes(normalizedSearch) ||
                user.email.toLocaleLowerCase("pt-BR").includes(normalizedSearch)
            const matchesProfile =
                selectedProfiles.length === 0 || selectedProfiles.includes(user.profile)
            const matchesClass =
                !className ||
                (user.profile === "STUDENT" && membership?.className === className)
            const matchesStatus = matchesUserStatus(
                status,
                summary.status,
                summary.accessCount,
            )

            return matchesSearch && matchesProfile && matchesClass && matchesStatus
        })
    }, [applicationId, className, institutionId, search, selectedProfiles, status, usersQuery.data])

    function setFilter(name: string, value?: string) {
        const nextParams = new URLSearchParams(searchParams)
        if (value) nextParams.set(name, value)
        else nextParams.delete(name)
        if (name !== "page") nextParams.delete("page")
        setSearchParams(nextParams)
    }

    function clearFilters() {
        setSearch("")
        const nextParams = new URLSearchParams()
        if (applicationId !== "all") nextParams.set("application", applicationId)
        if (pageSize !== 20) nextParams.set("pageSize", String(pageSize))
        setSearchParams(nextParams)
    }

    if (institutionsQuery.isPending || usersQuery.isPending) {
        return <PageLoader label="Carregando usuários..." />
    }

    if (institutionsQuery.isError || usersQuery.isError || !institution) {
        const error = institutionsQuery.error ?? usersQuery.error
        return (
            <PageError
                message={error?.message ?? "Instituição não encontrada"}
                onRetry={() => {
                    void institutionsQuery.refetch()
                    void usersQuery.refetch()
                }}
            />
        )
    }

    const applicationOptions = [
        { value: "all", label: "Todas as aplicações" },
        ...institution.applications.map(({ id, name }) => ({ value: id, label: name })),
    ]
    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize))
    const page = Math.min(requestedPage, totalPages)
    const visibleUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize)
    const hasFilters = Boolean(search || selectedProfiles.length > 0 || status || className)

    return (
        <Stack gap="xl" className={classes.page}>
            <div>
                <Anchor component={Link} to={`/institutions/${institutionId}`} size="sm" c="dimmed">
                    <Group gap={6}>
                        <ArrowLeft size={15} /> Voltar ao dashboard
                    </Group>
                </Anchor>
                <Group justify="space-between" align="flex-end" mt="xs">
                    <div>
                        <Title order={1}>Usuários</Title>
                        <Text c="dimmed">{institution.name} · alunos, professores e gestores</Text>
                    </div>
                    <Group gap="sm">
                        <AppBadge size="lg" tone="info">
                            {filteredUsers.length} usuários
                        </AppBadge>
                        <Button
                            component={Link}
                            to={`/institutions/${institutionId}/usage-plans`}
                            leftSection={<ListChecks size={17} />}
                            variant="light"
                        >
                            Gerenciar metas
                        </Button>
                    </Group>
                </Group>
            </div>

            <Paper withBorder radius="md" p="md">
                <Group align="flex-end" gap="sm">
                    <TextInput
                        label="Buscar usuário"
                        placeholder="Nome ou e-mail"
                        leftSection={<Search size={16} />}
                        value={search}
                        onChange={(event) => setSearch(event.currentTarget.value)}
                        flex={1}
                        miw={220}
                    />
                    <MultiSelect
                        label="Tipos de usuário"
                        placeholder="Todos os tipos"
                        data={USER_PROFILE_OPTIONS}
                        value={selectedProfiles}
                        onChange={(profiles) => setFilter("types", profiles.join(","))}
                        clearable
                        hidePickedOptions
                        w={{ base: "100%", sm: 245 }}
                    />
                    <Select
                        label="Situação"
                        placeholder="Todas as situações"
                        data={USER_STATUS_OPTIONS}
                        value={status}
                        onChange={(value) => setFilter("status", value ?? undefined)}
                        clearable
                        w={{ base: "100%", sm: 210 }}
                    />
                    <Select
                        label="Turma"
                        placeholder="Todas as turmas"
                        data={classOptions}
                        value={className || null}
                        onChange={(value) => setFilter("class", value ?? undefined)}
                        clearable
                        searchable
                        w={{ base: "100%", sm: 180 }}
                    />
                    <Select
                        label="Aplicação"
                        data={applicationOptions}
                        value={applicationId}
                        onChange={(value) => setFilter("application", value ?? "all")}
                        allowDeselect={false}
                        w={{ base: "100%", sm: 220 }}
                    />
                    {hasFilters && (
                        <Button
                            variant="subtle"
                            color="gray"
                            leftSection={<X size={16} />}
                            onClick={clearFilters}
                        >
                            Limpar
                        </Button>
                    )}
                </Group>
            </Paper>

            <Paper withBorder radius="md" className={classes.tableCard}>
                {visibleUsers.length === 0 ? (
                    <EmptyState message="Nenhum usuário corresponde aos filtros selecionados." />
                ) : (
                    <Table.ScrollContainer minWidth={980}>
                        <Table verticalSpacing="md" horizontalSpacing="lg" highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Usuário</Table.Th>
                                    <Table.Th>Perfil</Table.Th>
                                    <Table.Th>Turma / vínculo</Table.Th>
                                    <Table.Th>Aplicações</Table.Th>
                                    <Table.Th>Acessos / meta</Table.Th>
                                    <Table.Th>Último acesso</Table.Th>
                                    <Table.Th>Situação</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {visibleUsers.map((user) => {
                                    const { membership, goals, summary } = getUserGoals(
                                        user,
                                        institutionId,
                                        applicationId,
                                    )
                                    const membershipLabel =
                                        user.profile === "STUDENT"
                                            ? membership?.className
                                            : user.profile === "TEACHER"
                                              ? "Corpo docente"
                                              : "Gestão"

                                    return (
                                        <Table.Tr key={user.id}>
                                            <Table.Td>
                                                <Group gap="sm" wrap="nowrap">
                                                    <Avatar color={USER_PROFILE_COLORS[user.profile]} radius="xl">
                                                        {user.name
                                                            .split(" ")
                                                            .slice(0, 2)
                                                            .map((part) => part[0])
                                                            .join("")}
                                                    </Avatar>
                                                    <div>
                                                        <Anchor
                                                            component={Link}
                                                            to={`/users/${user.id}?institution=${institutionId}`}
                                                            fw={600}
                                                        >
                                                            {user.name}
                                                        </Anchor>
                                                        <Text size="xs" c="dimmed">{user.email}</Text>
                                                    </div>
                                                </Group>
                                            </Table.Td>
                                            <Table.Td>
                                                <ProfileBadge
                                                    profile={user.profile}
                                                    active={
                                                        selectedProfiles.length === 1 &&
                                                        selectedProfiles[0] === user.profile
                                                    }
                                                    onClick={() => setFilter("types", user.profile)}
                                                />
                                            </Table.Td>
                                            <Table.Td>
                                                <AppBadge
                                                    tone="neutral"
                                                    active={className === membershipLabel}
                                                    onClick={
                                                        user.profile === "STUDENT"
                                                            ? () => setFilter("class", membershipLabel)
                                                            : undefined
                                                    }
                                                >
                                                    {membershipLabel}
                                                </AppBadge>
                                            </Table.Td>
                                            <Table.Td>{goals.length}</Table.Td>
                                            <Table.Td>
                                                <Text fw={600}>
                                                    {summary.status === "NO_GOAL"
                                                        ? "—"
                                                        : `${summary.accessCount} / ${summary.minimumAccesses}`}
                                                </Text>
                                            </Table.Td>
                                            <Table.Td>{formatDate(summary.lastAccessAt)}</Table.Td>
                                            <Table.Td>
                                                <GoalStatusBadge
                                                    status={summary.status}
                                                    active={status === summary.status}
                                                    onClick={() => setFilter("status", summary.status)}
                                                />
                                            </Table.Td>
                                        </Table.Tr>
                                    )
                                })}
                            </Table.Tbody>
                        </Table>
                    </Table.ScrollContainer>
                )}

                <TablePagination
                    totalItems={filteredUsers.length}
                    page={page}
                    pageSize={pageSize}
                    onPageChange={(value) => setFilter("page", String(value))}
                    onPageSizeChange={(value) => setFilter("pageSize", String(value))}
                />
            </Paper>

            <Paper radius="md" p="md" bg="var(--mantine-color-indigo-light)">
                <Group gap="sm">
                    <UserRoundSearch size={20} color="var(--mantine-color-indigo-6)" />
                    <Text size="sm">
                        Clique em um perfil, turma ou situação para aplicar esse filtro à lista.
                        Clique no nome para consultar todas as metas do usuário.
                    </Text>
                </Group>
            </Paper>
        </Stack>
    )
}
