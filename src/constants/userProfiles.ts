import type { UserProfile } from "../types/domain"

export const USER_PROFILES: UserProfile[] = ["STUDENT", "TEACHER", "MANAGER"]

export const USER_PROFILE_LABELS: Record<
    UserProfile,
    { singular: string; plural: string }
> = {
    STUDENT: { singular: "Aluno", plural: "Alunos" },
    TEACHER: { singular: "Professor", plural: "Professores" },
    MANAGER: { singular: "Gestor", plural: "Gestores" },
}

export const USER_PROFILE_OPTIONS = USER_PROFILES.map((value) => ({
    value,
    label: USER_PROFILE_LABELS[value].plural,
}))

export const USER_PROFILE_COLORS: Record<UserProfile, string> = {
    STUDENT: "indigo",
    TEACHER: "cyan",
    MANAGER: "grape",
}
