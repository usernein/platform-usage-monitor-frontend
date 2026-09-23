import { Badge } from "@mantine/core"
import type { GoalStatus } from "../types/domain"
import { getStatusColor, getStatusLabel } from "../utils/usage"

export function GoalStatusBadge({ status }: { status: GoalStatus }) {
    return (
        <Badge color={getStatusColor(status)} variant="light" radius="sm">
            {getStatusLabel(status)}
        </Badge>
    )
}
