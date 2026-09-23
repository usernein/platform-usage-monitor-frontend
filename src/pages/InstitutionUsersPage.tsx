import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
    Anchor,
    Avatar,
    Badge,
    Group,
    Paper,
    Select,
    Stack,
    Table,
    Text,
    TextInput,
    Title,
} from "@mantine/core"
import { ArrowLeft, Search, UserRoundSearch } from "lucide-react"
import { Link, useParams, useSearchParams } from "react-router-dom"
import { getInstitutionStudents, getInstitutions } from "../api/mockApi"
import { GoalStatusBadge } from "../components/GoalStatusBadge"
import { EmptyState, PageError, PageLoader } from "../components/PageState"
import { formatDate, getStudentGoals } from "../utils/usage"
import classes from "./styles/UsersPage.module.css"

export function InstitutionUsersPage() {
    const { institutionId = "" } = useParams()
    const [searchParams, setSearchParams] = useSearchParams()
    const [search, setSearch] = useState("")
    const applicationId = searchParams.get("application") ?? "all"

    const institutionsQuery = useQuery({
        queryKey: ["institutions"],
        queryFn: getInstitutions,
    })
    const studentsQuery = useQuery({
        queryKey: ["institution-students", institutionId, applicationId],
        queryFn: () => getInstitutionStudents(institutionId, applicationId),
        enabled: Boolean(institutionId),
    })

    const institution = institutionsQuery.data?.find(({ id }) => id === institutionId)
    const filteredStudents = useMemo(() => {
        const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR")
        if (!studentsQuery.data || !normalizedSearch) return studentsQuery.data ?? []

        return studentsQuery.data.filter(
            ({ name, email }) =>
                name.toLocaleLowerCase("pt-BR").includes(normalizedSearch) ||
                email.toLocaleLowerCase("pt-BR").includes(normalizedSearch),
        )
    }, [search, studentsQuery.data])

    if (institutionsQuery.isPending || studentsQuery.isPending) {
        return <PageLoader label="Carregando alunos..." />
    }

    if (institutionsQuery.isError || studentsQuery.isError || !institution) {
        const error = institutionsQuery.error ?? studentsQuery.error
        return (
            <PageError
                message={error?.message ?? "Instituição não encontrada"}
                onRetry={() => {
                    void institutionsQuery.refetch()
                    void studentsQuery.refetch()
                }}
            />
        )
    }

    const applicationOptions = [
        { value: "all", label: "Todas as aplicações" },
        ...institution.applications.map(({ id, name }) => ({ value: id, label: name })),
    ]

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
                        <Title order={1}>Alunos</Title>
                        <Text c="dimmed">
                            {institution.name} · acompanhamento individual de metas
                        </Text>
                    </div>
                    <Badge size="lg" variant="light" color="indigo">
                        {filteredStudents.length} alunos no mock
                    </Badge>
                </Group>
            </div>

            <Paper withBorder radius="md" p="md">
                <Group align="flex-end">
                    <TextInput
                        label="Buscar aluno"
                        placeholder="Nome ou e-mail"
                        leftSection={<Search size={16} />}
                        value={search}
                        onChange={(event) => setSearch(event.currentTarget.value)}
                        flex={1}
                        miw={240}
                    />
                    <Select
                        label="Aplicação"
                        data={applicationOptions}
                        value={applicationId}
                        onChange={(value) =>
                            setSearchParams({ application: value ?? "all" })
                        }
                        allowDeselect={false}
                        w={{ base: "100%", sm: 240 }}
                    />
                </Group>
            </Paper>

            <Paper withBorder radius="md" className={classes.tableCard}>
                {filteredStudents.length === 0 ? (
                    <EmptyState message="Nenhum aluno corresponde aos filtros selecionados." />
                ) : (
                    <Table.ScrollContainer minWidth={860}>
                        <Table verticalSpacing="md" horizontalSpacing="lg" highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Aluno</Table.Th>
                                    <Table.Th>Turma</Table.Th>
                                    <Table.Th>Aplicações</Table.Th>
                                    <Table.Th>Acessos / meta</Table.Th>
                                    <Table.Th>Último acesso</Table.Th>
                                    <Table.Th>Situação</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {filteredStudents.map((student) => {
                                    const { membership, goals, summary } = getStudentGoals(
                                        student,
                                        institutionId,
                                        applicationId,
                                    )

                                    return (
                                        <Table.Tr key={student.id}>
                                            <Table.Td>
                                                <Group gap="sm" wrap="nowrap">
                                                    <Avatar color="indigo" radius="xl">
                                                        {student.name
                                                            .split(" ")
                                                            .slice(0, 2)
                                                            .map((part) => part[0])
                                                            .join("")}
                                                    </Avatar>
                                                    <div>
                                                        <Anchor
                                                            component={Link}
                                                            to={`/users/${student.id}?institution=${institutionId}`}
                                                            fw={600}
                                                        >
                                                            {student.name}
                                                        </Anchor>
                                                        <Text size="xs" c="dimmed">
                                                            {student.email}
                                                        </Text>
                                                    </div>
                                                </Group>
                                            </Table.Td>
                                            <Table.Td>{membership?.className}</Table.Td>
                                            <Table.Td>{goals.length}</Table.Td>
                                            <Table.Td>
                                                <Text fw={600}>
                                                    {summary.accessCount} / {summary.minimumAccesses}
                                                </Text>
                                            </Table.Td>
                                            <Table.Td>{formatDate(summary.lastAccessAt)}</Table.Td>
                                            <Table.Td>
                                                <GoalStatusBadge status={summary.status} />
                                            </Table.Td>
                                        </Table.Tr>
                                    )
                                })}
                            </Table.Tbody>
                        </Table>
                    </Table.ScrollContainer>
                )}
            </Paper>

            <Paper radius="md" p="md" bg="var(--mantine-color-indigo-light)">
                <Group gap="sm">
                    <UserRoundSearch size={20} color="var(--mantine-color-indigo-6)" />
                    <Text size="sm">
                        Clique no nome de um aluno para consultar suas instituições, aplicações e
                        relação com cada meta elegível.
                    </Text>
                </Group>
            </Paper>
        </Stack>
    )
}
