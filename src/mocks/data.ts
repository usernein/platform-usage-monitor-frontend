import type {
    Application,
    GoalFrequency,
    GoalStatus,
    Institution,
    Student,
    StudentMembership,
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
