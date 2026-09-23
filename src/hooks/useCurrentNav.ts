import { useMemo } from "react"
import { useLocation } from "react-router-dom"
import { sideLinks } from "../assets/navLinks"

function matchesPath(currentPath: string, targetPath: string) {
    return targetPath === "/"
        ? currentPath === targetPath
        : currentPath === targetPath || currentPath.startsWith(`${targetPath}/`)
}

export default function useCurrentNav() {
    const { pathname } = useLocation()

    return useMemo(
        () =>
            sideLinks.find(
                (link) =>
                    matchesPath(pathname, link.href) ||
                    link.subs.some((sub) => matchesPath(pathname, sub.href)),
            ) ?? sideLinks[0],
        [pathname],
    )
}
