import type {
    Application,
    GoalFrequency,
    GoalStatus,
    Institution,
    Student,
    StudentMembership,
    UsagePlan,
} from "../types/domain"

export const applications: Application[] = [
    { id: "aprimora", name: "Aprimora" },
    { id: "google-classroom", name: "Google Classroom" },
    { id: "arvore", name: "Árvore" },
    { id: "plurall", name: "Plurall" },
    { id: "teams", name: "Microsoft Teams" },
]

export const institutions: Institution[] = [
    {
        id: "universidade-positivo",
        name: "Universidade Positivo",
        score: 86,
        applications: applications.filter(({ id }) =>
            ["aprimora", "google-classroom", "teams"].includes(id),
        ),
        eligibleUsers: 1284,
        goalsMeeting: 18,
        totalGoals: 21,
    },
    {
        id: "escola-grace",
        name: "Escola Grace",
        score: 73,
        applications: applications.filter(({ id }) =>
            ["aprimora", "arvore", "google-classroom"].includes(id),
        ),
        eligibleUsers: 642,
        goalsMeeting: 11,
        totalGoals: 15,
    },
    {
        id: "faculdade-estacio",
        name: "Faculdade Estácio",
        score: 58,
        applications: applications.filter(({ id }) =>
            ["google-classroom", "plurall", "teams"].includes(id),
        ),
        eligibleUsers: 1736,
        goalsMeeting: 14,
        totalGoals: 24,
    },
    {
        id: "colegio-marista",
        name: "Colégio Marista",
        score: 92,
        applications: applications.filter(({ id }) =>
            ["aprimora", "arvore", "plurall", "teams"].includes(id),
        ),
        eligibleUsers: 918,
        goalsMeeting: 22,
        totalGoals: 24,
    },
]

const studentNames = [
    "Ana Clara Souza",
    "Bruno Henrique Lima",
    "Camila Rodrigues",
    "Daniel Oliveira",
    "Eduarda Martins",
    "Felipe Almeida",
    "Gabriela Santos",
    "Henrique Costa",
    "Isabela Ferreira",
    "João Pedro Ribeiro",
    "Larissa Gomes",
    "Matheus Carvalho",
    "Natalia Rocha",
    "Otávio Moreira",
    "Paula Mendes",
    "Rafael Nunes",
    "Sofia Barros",
    "Thiago Cardoso",
    "Vitória Freitas",
    "Yuri Monteiro",
]

const teacherNames = [
    "Mariana Alves",
    "Carlos Eduardo Pinto",
    "Fernanda Lima",
    "Ricardo Azevedo",
    "Patrícia Moraes",
    "André Vasconcelos",
    "Luciana Castro",
    "Gustavo Peixoto",
]

const managerNames = [
    "Beatriz Tavares",
    "Cláudio Rezende",
    "Débora Freire",
    "Eduardo Siqueira",
    "Helena Prado",
    "Marcelo Dantas",
]

const classNames = ["1º A", "1º B", "2º A", "2º B", "3º A"]
const frequencies: GoalFrequency[] = ["WEEKLY", "WEEKLY", "MONTHLY"]

function normalizeEmail(name: string) {
    return name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replaceAll(" ", ".")
}

function createMembership(
    institution: Institution,
    studentIndex: number,
    membershipIndex: number,
): StudentMembership {
    const className = classNames[(studentIndex + membershipIndex) % classNames.length]
    const appCount = 1 + ((studentIndex + membershipIndex) % institution.applications.length)
    const rotatedApplications = institution.applications
        .slice(membershipIndex)
        .concat(institution.applications.slice(0, membershipIndex))
        .slice(0, appCount)

    return {
        institutionId: institution.id,
        className,
        enrolledAt: `202${3 + (studentIndex % 3)}-02-01T12:00:00.000Z`,
        goals: rotatedApplications.map((application, applicationIndex) => {
            const frequency = frequencies[(studentIndex + applicationIndex) % frequencies.length]
            const minimumAccesses = frequency === "MONTHLY" ? 8 : 2 + (applicationIndex % 2)
            const accessDelta = ((studentIndex + applicationIndex + membershipIndex) % 6) - 2
            const accessCount = Math.max(0, minimumAccesses + accessDelta)
            const progress = accessCount / minimumAccesses
            const status: GoalStatus =
                progress >= 1 ? "MET" : progress >= 0.5 ? "AT_RISK" : "NOT_MET"

            return {
                applicationId: application.id,
                frequency,
                minimumAccesses,
                accessCount,
                status,
                targetAudience:
                    (studentIndex + applicationIndex) % 2 === 0
                        ? `Turma ${className}`
                        : "Perfil STUDENT",
                lastAccessAt:
                    accessCount > 0
                        ? `2026-09-${String(22 - ((studentIndex + applicationIndex) % 12)).padStart(2, "0")}T${String(8 + (studentIndex % 9)).padStart(2, "0")}:30:00.000Z`
                        : null,
            }
        }),
    }
}

function createEducatorMembership(
    institution: Institution,
    educatorIndex: number,
    membershipIndex: number,
    profile: "TEACHER" | "MANAGER",
): StudentMembership {
    const appCount = 1 + ((educatorIndex + membershipIndex) % institution.applications.length)
    const eligibleApplications = institution.applications.slice(0, appCount)

    return {
        institutionId: institution.id,
        className: profile === "TEACHER" ? "Corpo docente" : "Gestão",
        enrolledAt: `202${2 + (educatorIndex % 4)}-02-01T12:00:00.000Z`,
        goals: eligibleApplications.map((application, applicationIndex) => {
            const minimumAccesses = 6 + (applicationIndex % 3)
            const accessDelta = ((educatorIndex + applicationIndex + membershipIndex) % 7) - 3
            const accessCount = Math.max(0, minimumAccesses + accessDelta)
            const progress = accessCount / minimumAccesses
            const status: GoalStatus =
                progress >= 1 ? "MET" : progress >= 0.5 ? "AT_RISK" : "NOT_MET"

            return {
                applicationId: application.id,
                frequency: "MONTHLY",
                minimumAccesses,
                accessCount,
                status,
                targetAudience:
                    (educatorIndex + applicationIndex) % 2 === 0
                        ? `Perfil ${profile}`
                        : profile === "TEACHER"
                          ? "Professor específico"
                          : "Gestor específico",
                lastAccessAt:
                    accessCount > 0
                        ? `2026-09-${String(22 - ((educatorIndex + applicationIndex) % 10)).padStart(2, "0")}T${String(8 + (educatorIndex % 8)).padStart(2, "0")}:15:00.000Z`
                        : null,
            }
        }),
    }
}

export const students: Student[] = studentNames.map((name, index) => {
    return {
        id: `student-${String(index + 1).padStart(2, "0")}`,
        name,
        email: `${normalizeEmail(name)}@aluno.edu.br`,
        profile: "STUDENT",
        memberships: institutions.map((institution, membershipIndex) =>
            createMembership(institution, index, membershipIndex),
        ),
    }
})

export const teachers: Student[] = teacherNames.map((name, index) => ({
    id: `teacher-${String(index + 1).padStart(2, "0")}`,
    name,
    email: `${normalizeEmail(name)}@professor.edu.br`,
    profile: "TEACHER",
    memberships: institutions.map((institution, membershipIndex) =>
        createEducatorMembership(institution, index, membershipIndex, "TEACHER"),
    ),
}))

export const managers: Student[] = managerNames.map((name, index) => ({
    id: `manager-${String(index + 1).padStart(2, "0")}`,
    name,
    email: `${normalizeEmail(name)}@gestao.edu.br`,
    profile: "MANAGER",
    memberships: institutions.map((institution, membershipIndex) =>
        createEducatorMembership(institution, index + 2, membershipIndex, "MANAGER"),
    ),
}))

export const educators = [...teachers, ...managers]

export const usagePlans: UsagePlan[] = institutions.flatMap(
    (institution, institutionIndex) =>
        institution.applications.slice(0, 3).map((application, applicationIndex) => ({
            id: `${institution.id}-${application.id}-${applicationIndex + 1}`,
            institutionId: institution.id,
            applicationId: application.id,
            profile:
                applicationIndex === 0
                    ? "STUDENT"
                    : applicationIndex === 1
                      ? "TEACHER"
                      : "MANAGER",
            frequency: applicationIndex === 0 ? "WEEKLY" : "MONTHLY",
            minimumAccesses: applicationIndex === 0 ? 2 : 8,
            classNames:
                applicationIndex === 0
                    ? [classNames[institutionIndex % classNames.length]]
                    : [],
            userIds:
                applicationIndex === 0 && institutionIndex % 2 === 0
                    ? students
                          .slice(institutionIndex, institutionIndex + 2)
                          .map(({ id }) => id)
                    : educators
                          .filter(
                              ({ profile }) =>
                                  profile ===
                                  (applicationIndex === 1 ? "TEACHER" : "MANAGER"),
                          )
                          .slice(institutionIndex, institutionIndex + 2)
                          .map(({ id }) => id),
            updatedAt: "2026-09-20T14:00:00.000Z",
        })),
)
