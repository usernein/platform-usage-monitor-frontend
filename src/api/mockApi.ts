import { applications, institutions, students } from "../mocks/data"
import type {
    ApplicationIndicator,
    DashboardFilters,
    Institution,
    InstitutionDashboard,
    Student,
} from "../types/domain"

const simulatedLatency = 350

function wait() {
    return new Promise((resolve) => window.setTimeout(resolve, simulatedLatency))
}

function findInstitution(institutionId: string) {
    const institution = institutions.find(({ id }) => id === institutionId)
    if (!institution) {
        throw new Error("Instituição não encontrada")
    }
    return institution
}

function scoreColorOffset(index: number) {
    return [-8, 4, -2, 7][index % 4]
}

function buildApplicationIndicators(institution: Institution): ApplicationIndicator[] {
    return institution.applications.map((application, index) => ({
        applicationId: application.id,
        application: application.name,
        adherence: Math.max(32, Math.min(98, institution.score + scoreColorOffset(index))),
        accesses: Math.round(institution.eligibleUsers * (3.2 + index * 0.85)),
        activeUsers: Math.round(institution.eligibleUsers * (0.64 + index * 0.07)),
    }))
}

function parseDate(date: string) {
    return new Date(`${date}T00:00:00.000Z`)
}

function rangeDays(filters: DashboardFilters) {
    const milliseconds =
        parseDate(filters.endDate).getTime() - parseDate(filters.startDate).getTime()
    return Math.max(1, Math.round(milliseconds / 86_400_000) + 1)
}

function periodLabels(filters: DashboardFilters) {
    const start = parseDate(filters.startDate)
    const end = parseDate(filters.endDate)
    const days = rangeDays(filters)
    const pointCount = days <= 7 ? days : 6
    const formatter = new Intl.DateTimeFormat("pt-BR", {
        day: days > 90 ? undefined : "2-digit",
        month: "short",
    })

    return Array.from({ length: pointCount }, (_, index) => {
        const ratio = pointCount === 1 ? 0 : index / (pointCount - 1)
        const date = new Date(start.getTime() + (end.getTime() - start.getTime()) * ratio)
        return formatter.format(date).replace(" de ", " ").replace(".", "")
    })
}

function periodMultiplier(filters: DashboardFilters) {
    return Math.max(0.1, Math.min(12, rangeDays(filters) / 30))
}

export async function getInstitutions(): Promise<Institution[]> {
    await wait()
    return institutions
}

export async function getInstitutionDashboard(
    institutionId: string,
    filters: DashboardFilters,
): Promise<InstitutionDashboard> {
    await wait()
    const institution = findInstitution(institutionId)
    const allApplicationIndicators = buildApplicationIndicators(institution)
    const selectedApplication = allApplicationIndicators.find(
        ({ applicationId }) => applicationId === filters.applicationId,
    )
    const adherenceRate = selectedApplication?.adherence ?? institution.score
    const eligibleUsers = selectedApplication
        ? Math.round(institution.eligibleUsers * 0.72)
        : institution.eligibleUsers
    const usersMeetingGoal = Math.round(eligibleUsers * (adherenceRate / 100))
    const usersNotMeetingGoal = eligibleUsers - usersMeetingGoal
    const multiplier = periodMultiplier(filters)
    const baseAccesses = selectedApplication?.accesses ??
        allApplicationIndicators.reduce((total, item) => total + item.accesses, 0)

    return {
        institution,
        filters,
        summary: {
            eligibleUsers,
            usersMeetingGoal,
            usersNotMeetingGoal,
            adherenceRate,
            activeUserRate: Math.min(98, adherenceRate + 6),
            adherenceTrend: Number(
                (((institution.score % 9) - 2.5) * Math.min(multiplier, 2)).toFixed(1),
            ),
            usersAtRisk: Math.round(usersNotMeetingGoal * 0.34),
            goalCoverage: Math.min(100, institution.score + 5),
        },
        evolution: periodLabels(filters).map((period, index, labels) => ({
            period,
            accesses: Math.round(
                (baseAccesses * multiplier * (0.72 + index * 0.075)) / labels.length,
            ),
            adherence: Math.max(
                0,
                Math.min(100, adherenceRate - 6 + index * 1.6 + ((index % 2) * 1.4)),
            ),
        })),
        applications: selectedApplication
            ? [selectedApplication]
            : allApplicationIndicators.sort((a, b) => b.adherence - a.adherence),
        profileAdoption: [
            { profile: "Alunos", adherence: Math.max(0, adherenceRate - 2) },
            { profile: "Professores", adherence: Math.min(100, adherenceRate + 5) },
        ],
    }
}

export async function getInstitutionStudents(
    institutionId: string,
    applicationId = "all",
): Promise<Student[]> {
    await wait()
    findInstitution(institutionId)

    return students.filter((student) =>
        student.memberships.some(
            (membership) =>
                membership.institutionId === institutionId &&
                (applicationId === "all" ||
                    membership.goals.some((goal) => goal.applicationId === applicationId)),
        ),
    )
}

export async function getStudent(studentId: string): Promise<Student> {
    await wait()
    const student = students.find(({ id }) => id === studentId)
    if (!student) {
        throw new Error("Aluno não encontrado")
    }
    return student
}

export function getApplicationName(applicationId: string) {
    return applications.find(({ id }) => id === applicationId)?.name ?? applicationId
}
