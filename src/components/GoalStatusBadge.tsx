import type { GoalStatus } from "../types/domain"
import { getStatusLabel } from "../utils/usage"
import { AppBadge, type AppBadgeTone } from "./AppBadge"

interface GoalStatusBadgeProps {
    status: GoalStatus
    active?: boolean
    onClick?: () => void
}

export function GoalStatusBadge({ status, active, onClick }: GoalStatusBadgeProps) {
    const tones: Record<GoalStatus, AppBadgeTone> = {
        MET: "success",
        AT_RISK: "warning",
        NOT_MET: "danger",
    }

    return (
        <AppBadge tone={tones[status]} active={active} onClick={onClick}>
            {getStatusLabel(status)}
        </AppBadge>
    )
}
