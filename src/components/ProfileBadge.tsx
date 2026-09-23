import type { UserProfile } from "../types/domain"
import { USER_PROFILE_LABELS } from "../constants/userProfiles"
import { AppBadge, type AppBadgeTone } from "./AppBadge"

interface ProfileBadgeProps {
    profile: UserProfile
    plural?: boolean
    active?: boolean
    onClick?: () => void
}

const profileTones: Record<UserProfile, AppBadgeTone> = {
    STUDENT: "student",
    TEACHER: "teacher",
    MANAGER: "manager",
}

export function ProfileBadge({ profile, plural, active, onClick }: ProfileBadgeProps) {
    const labels = USER_PROFILE_LABELS[profile]

    return (
        <AppBadge tone={profileTones[profile]} active={active} onClick={onClick}>
            {plural ? labels.plural : labels.singular}
        </AppBadge>
    )
}
