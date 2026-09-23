import type { LucideIcon } from "lucide-react"
import {
    ChartNoAxesCombined,
    ClipboardCheck,
    Gauge,
    Settings,
    Users,
} from "lucide-react"

export interface NavLink {
    title: string
    label: string
    href: string
    icon: LucideIcon
}

export interface SideLink extends NavLink {
    subs: NavLink[]
}

export const sideLinks: SideLink[] = [
    {
        title: "Monitoramento",
        label: "Monitoramento",
        href: "/",
        icon: Gauge,
        subs: [
            {
                title: "Instituições",
                label: "Instituições",
                href: "/",
                icon: ChartNoAxesCombined,
            },
            {
                title: "Alunos",
                label: "Alunos",
                href: "/institutions/universidade-positivo/users",
                icon: Users,
            },
        ],
    },
    {
        title: "Configuração",
        label: "Configuração",
        href: "/usage-plans",
        icon: Settings,
        subs: [
            {
                title: "Planos de uso",
                label: "Planos de uso",
                href: "/usage-plans",
                icon: ClipboardCheck,
            },
        ],
    },
]
