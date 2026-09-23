export type UserProfile = "STUDENT" | "TEACHER" | "MANAGER"
export type GoalFrequency = "DAILY" | "WEEKLY" | "MONTHLY"
export type GoalStatus = "MET" | "AT_RISK" | "NOT_MET" | "NO_GOAL"

export interface Application {
    id: string
    name: string
    color: string
}

export interface Institution {
    id: string
    name: string
    score: number
    applications: Application[]
    eligibleUsers: number
    goalsMeeting: number
    totalGoals: number
}

export interface DashboardFilters {
    applicationId: string
    startDate: string
    endDate: string
}

export interface DashboardSummary {
    eligibleUsers: number
    usersMeetingGoal: number
    usersNotMeetingGoal: number
    adherenceRate: number
    activeUserRate: number
    adherenceTrend: number
    usersAtRisk: number
    usersWithoutGoal: number
    goalCoverage: number
}

export interface EvolutionPoint {
    period: string
    accesses: number
    adherence: number
}

export interface ApplicationIndicator {
    applicationId: string
    application: string
    adherence: number
    accesses: number
    activeUsers: number
}

export interface ProfileIndicator {
    profile: "Alunos" | "Educadores"
    adherence: number
}

export interface InstitutionDashboard {
    institution: Institution
    filters: DashboardFilters
    summary: DashboardSummary
    evolution: EvolutionPoint[]
    applications: ApplicationIndicator[]
    profileAdoption: ProfileIndicator[]
}

export interface UsagePlan {
    id: string
    institutionId: string
    applicationId: string
    profile: UserProfile
    frequency: GoalFrequency
    minimumAccesses: number
    classNames: string[]
    userIds: string[]
    updatedAt: string
}

export interface UserGoalRelation {
    applicationId: string
    frequency: GoalFrequency
    minimumAccesses: number
    accessCount: number
    status: GoalStatus
    targetAudience: string
    lastAccessAt: string | null
}

export interface StudentMembership {
    institutionId: string
    className: string
    enrolledAt: string
    goals: UserGoalRelation[]
}

export interface Student {
    id: string
    name: string
    email: string
    profile: UserProfile
    memberships: StudentMembership[]
    accessEvents: AccessEvent[]
}

export interface AccessEvent {
    id: string
    userId: string
    applicationId: string
    accessedAt: string
}
