import type { GoalStatus } from "../types/domain"

export type UserStatusFilter = GoalStatus | "BELOW_GOAL" | "ACTIVE" | "INACTIVE"

export const USER_STATUS_OPTIONS = [
    { value: "MET", label: "Meta atingida" },
    { value: "BELOW_GOAL", label: "Ainda não atingiram" },
    { value: "NOT_MET", label: "Meta não atingida" },
    { value: "AT_RISK", label: "Em risco" },
    { value: "NO_GOAL", label: "Sem meta" },
    { value: "ACTIVE", label: "Usuários ativos" },
    { value: "INACTIVE", label: "Usuários inativos" },
]

const userStatuses: UserStatusFilter[] = [
    "MET",
    "BELOW_GOAL",
    "NOT_MET",
    "AT_RISK",
    "NO_GOAL",
    "ACTIVE",
    "INACTIVE",
]

export function parseUserStatus(value: string | null): UserStatusFilter | null {
    return userStatuses.includes(value as UserStatusFilter)
        ? (value as UserStatusFilter)
        : null
}

export function matchesUserStatus(
    filter: UserStatusFilter | null,
    status: GoalStatus,
    accessCount: number,
) {
    if (!filter) return true
    if (filter === "ACTIVE") return accessCount > 0
    if (filter === "INACTIVE") return accessCount === 0
    if (filter === "BELOW_GOAL") return status === "NOT_MET" || status === "AT_RISK"
    return status === filter
}
