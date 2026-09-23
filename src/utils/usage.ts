import type { GoalStatus, Student, UserGoalRelation } from "../types/domain"

export const numberFormatter = new Intl.NumberFormat("pt-BR")

export function formatDate(date: string | null) {
    if (!date) {
        return "Sem acesso"
    }

    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(date))
}

export function getScoreColor(score: number) {
    if (score >= 85) return "teal"
    if (score >= 70) return "indigo"
    if (score >= 55) return "yellow"
    return "red"
}

export function getStatusLabel(status: GoalStatus) {
    if (status === "MET") return "Meta atingida"
    if (status === "AT_RISK") return "Em risco"
    return "Meta não atingida"
}

export function summarizeGoals(goals: UserGoalRelation[]) {
    const accessCount = goals.reduce((total, goal) => total + goal.accessCount, 0)
    const minimumAccesses = goals.reduce(
        (total, goal) => total + goal.minimumAccesses,
        0,
    )
    const status: GoalStatus = goals.every(({ status }) => status === "MET")
        ? "MET"
        : goals.some(({ status }) => status === "AT_RISK")
          ? "AT_RISK"
          : "NOT_MET"
    const lastAccessAt = goals
        .map(({ lastAccessAt }) => lastAccessAt)
        .filter((date): date is string => Boolean(date))
        .sort()
        .at(-1) ?? null

    return { accessCount, minimumAccesses, status, lastAccessAt }
}

export function getUserGoals(
    user: Student,
    institutionId: string,
    applicationId: string,
) {
    const membership = user.memberships.find(
        ({ institutionId: currentInstitutionId }) =>
            currentInstitutionId === institutionId,
    )
    const goals =
        applicationId === "all"
            ? (membership?.goals ?? [])
            : (membership?.goals.filter(
                  ({ applicationId: currentApplicationId }) =>
                      currentApplicationId === applicationId,
              ) ?? [])

    return { membership, goals, summary: summarizeGoals(goals) }
}
