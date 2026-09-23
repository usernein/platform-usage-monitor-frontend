export type UserProfile = "STUDENT" | "TEACHER"
export type GoalFrequency = "DAILY" | "WEEKLY" | "MONTHLY"
export type GoalStatus = "MET" | "AT_RISK" | "NOT_MET"
export type DashboardPeriod = "7d" | "30d" | "90d"

export interface Application {
    id: string
    name: string
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
    period: DashboardPeriod
}

export interface DashboardSummary {
    eligibleUsers: number
    usersMeetingGoal: number
    usersNotMeetingGoal: number
    adherenceRate: number
    activeUserRate: number
    adherenceTrend: number
    usersAtRisk: number
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
    profile: "Alunos" | "Professores"
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
}
