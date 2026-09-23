import { create } from "zustand"

interface AppStore {
    isNavbarCollapse: boolean
    openNavbar: () => void
    closeNavbar: () => void
    toggleNavbar: () => void
}

export const useStore = create<AppStore>((set) => ({
    isNavbarCollapse: true,
    openNavbar: () => set({ isNavbarCollapse: true }),
    closeNavbar: () => set({ isNavbarCollapse: false }),
    toggleNavbar: () =>
        set((state) => ({ isNavbarCollapse: !state.isNavbarCollapse })),
}))
