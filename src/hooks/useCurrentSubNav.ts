import { useMemo } from "react"
import { sideLinks } from "../assets/navLinks"

interface UseCurrentSubNavOptions {
    appTitle: string
}

export default function useCurrentSubNav({ appTitle }: UseCurrentSubNavOptions) {
    return useMemo(
        () => sideLinks.find((link) => link.title === appTitle) ?? sideLinks[0],
        [appTitle],
    )
}
