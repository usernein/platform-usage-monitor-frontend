import { useMemo, useState } from "react"
import {
    ActionIcon,
    Box,
    Group,
    Paper,
    SegmentedControl,
    Stack,
    Table,
    Text,
    Title,
    Tooltip,
} from "@mantine/core"
import { YearView, type ScheduleEventData } from "@mantine/schedule"
import dayjs from "dayjs"
import "dayjs/locale/pt-br"
import { CalendarDays, ChevronLeft, ChevronRight, List } from "lucide-react"
import { getApplicationColor, getApplicationName } from "../api/mockApi"
import type { AccessEvent } from "../types/domain"
import { EmptyState } from "./PageState"
import { TablePagination } from "./TablePagination"
import classes from "./UserAccessHistory.module.css"

type HistoryView = "table" | "calendar"

interface UserAccessHistoryProps {
    events: AccessEvent[]
}

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
})

function applicationDayBackground(colors: string[]) {
    if (colors.length === 1) {
        return `var(--mantine-color-${colors[0]}-light)`
    }

    const step = 100 / colors.length
    const stops = colors.flatMap((color, index) => [
        `var(--mantine-color-${color}-light) ${index * step}%`,
        `var(--mantine-color-${color}-light) ${(index + 1) * step}%`,
    ])

    return `linear-gradient(135deg, ${stops.join(", ")})`
}

export function UserAccessHistory({ events }: UserAccessHistoryProps) {
    const [view, setView] = useState<HistoryView>("table")
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(20)
    const [pinnedDate, setPinnedDate] = useState<string | null>(null)
    const latestEventDate = events[0]?.accessedAt ?? new Date().toISOString()
    const [calendarDate, setCalendarDate] = useState(() => dayjs(latestEventDate).toDate())

    const sortedEvents = useMemo(
        () => [...events].sort((a, b) => b.accessedAt.localeCompare(a.accessedAt)),
        [events],
    )
    const visibleEvents = sortedEvents.slice((page - 1) * pageSize, page * pageSize)
    const scheduleEvents = useMemo<ScheduleEventData[]>(
        () =>
            sortedEvents.map((event) => {
                const start = dayjs(event.accessedAt)

                return {
                    id: event.id,
                    title: getApplicationName(event.applicationId),
                    start: start.format("YYYY-MM-DD HH:mm:ss"),
                    end: start.add(1, "minute").format("YYYY-MM-DD HH:mm:ss"),
                    color: getApplicationColor(event.applicationId),
                }
            }),
        [sortedEvents],
    )
    const eventsByDate = useMemo(() => {
        const grouped = new Map<string, ScheduleEventData[]>()

        scheduleEvents.forEach((event) => {
            const date = dayjs(event.start).format("YYYY-MM-DD")
            grouped.set(date, [...(grouped.get(date) ?? []), event])
        })

        return grouped
    }, [scheduleEvents])

    return (
        <Paper withBorder radius="lg" className={classes.root}>
            <Group justify="space-between" align="flex-start" p="lg" className={classes.header}>
                <div>
                    <Title order={2} size="h3">
                        Histórico de acessos
                    </Title>
                    <Text c="dimmed" size="sm" mt={3}>
                        {events.length} acesso(s) registrado(s) nas aplicações
                    </Text>
                </div>
                <SegmentedControl
                    value={view}
                    onChange={(value) => setView(value as HistoryView)}
                    data={[
                        {
                            value: "table",
                            label: (
                                <Group gap={6} wrap="nowrap">
                                    <List size={15} /> Tabela
                                </Group>
                            ),
                        },
                        {
                            value: "calendar",
                            label: (
                                <Group gap={6} wrap="nowrap">
                                    <CalendarDays size={15} /> Calendário
                                </Group>
                            ),
                        },
                    ]}
                />
            </Group>

            {events.length === 0 ? (
                <EmptyState message="Nenhum acesso foi registrado para este usuário." />
            ) : view === "table" ? (
                <>
                    <Table.ScrollContainer minWidth={560}>
                        <Table verticalSpacing="md" horizontalSpacing="lg" highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Data e hora</Table.Th>
                                    <Table.Th>Aplicação</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {visibleEvents.map((event) => (
                                    <Table.Tr key={event.id}>
                                        <Table.Td>
                                            <Text size="sm" fw={500}>
                                                {dateTimeFormatter.format(new Date(event.accessedAt))}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Group gap="sm" wrap="nowrap">
                                                <Box
                                                    className={classes.applicationColor}
                                                    bg={`var(--mantine-color-${getApplicationColor(event.applicationId)}-6)`}
                                                />
                                                <Text size="sm">
                                                    {getApplicationName(event.applicationId)}
                                                </Text>
                                            </Group>
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    </Table.ScrollContainer>
                    <TablePagination
                        totalItems={events.length}
                        page={page}
                        pageSize={pageSize}
                        onPageChange={setPage}
                        onPageSizeChange={(value) => {
                            setPageSize(value)
                            setPage(1)
                        }}
                    />
                </>
            ) : (
                <Stack gap="md" p="lg" pt={0}>
                    <Group justify="space-between" className={classes.yearNavigation}>
                        <ActionIcon
                            variant="subtle"
                            aria-label="Ano anterior"
                            onClick={() =>
                                setCalendarDate((date) =>
                                    dayjs(date).subtract(1, "year").toDate(),
                                )
                            }
                        >
                            <ChevronLeft size={18} />
                        </ActionIcon>
                        <Text fw={700}>{dayjs(calendarDate).format("YYYY")}</Text>
                        <ActionIcon
                            variant="subtle"
                            aria-label="Próximo ano"
                            onClick={() =>
                                setCalendarDate((date) =>
                                    dayjs(date).add(1, "year").toDate(),
                                )
                            }
                        >
                            <ChevronRight size={18} />
                        </ActionIcon>
                    </Group>
                    <Text size="xs" c="dimmed">
                        Passe o mouse ou clique em um dia colorido para consultar os acessos.
                    </Text>
                    <Box className={classes.calendarScroll}>
                        <YearView
                            date={calendarDate}
                            events={scheduleEvents}
                            locale="pt-br"
                            firstDayOfWeek={1}
                            withHeader={false}
                            classNames={{
                                yearViewMonths: classes.yearMonths,
                                yearViewDay: classes.yearDay,
                            }}
                            getDayProps={(date) => {
                                const dayEvents = eventsByDate.get(date) ?? []
                                const colors = [...new Set(dayEvents.map(({ color }) => color))]

                                return {
                                    style:
                                        colors.length > 0
                                            ? { background: applicationDayBackground(colors) }
                                            : undefined,
                                    "aria-label":
                                        dayEvents.length > 0
                                            ? `${dayEvents.length} acesso(s) em ${date}`
                                            : date,
                                }
                            }}
                            onDayClick={(date) => {
                                setPinnedDate((current) =>
                                    eventsByDate.has(date) && current !== date ? date : null,
                                )
                            }}
                            renderDay={(date, dayEvents) => {
                                const content = (
                                    <span className={classes.dayContent}>
                                        <span>{dayjs(date).date()}</span>
                                        {dayEvents.length > 0 && (
                                            <span className={classes.dayEventCount}>
                                                {dayEvents.length}
                                            </span>
                                        )}
                                    </span>
                                )

                                if (dayEvents.length === 0) return content

                                return (
                                    <Tooltip
                                        withArrow
                                        multiline
                                        position="top"
                                        opened={pinnedDate === date ? true : undefined}
                                        label={
                                            <Stack gap={4}>
                                                <Text size="xs" fw={700}>
                                                    {dayjs(date)
                                                        .locale("pt-br")
                                                        .format("DD [de] MMMM")}
                                                </Text>
                                                {[...dayEvents]
                                                    .sort((a, b) =>
                                                        String(a.start).localeCompare(String(b.start)),
                                                    )
                                                    .map((event) => (
                                                        <Text key={event.id} size="xs">
                                                            {dayjs(event.start).format("HH:mm")} – {event.title}
                                                        </Text>
                                                    ))}
                                            </Stack>
                                        }
                                    >
                                        {content}
                                    </Tooltip>
                                )
                            }}
                        />
                    </Box>
                </Stack>
            )}
        </Paper>
    )
}
