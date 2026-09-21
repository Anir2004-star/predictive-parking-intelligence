import { create } from "zustand";

export interface SystemState {
  isSidebarOpen: boolean;
  activeHotspotId: string | null;
  toggleSidebar: () => void;
  setActiveHotspotId: (id: string | null) => void;
}

export const useSystemStore = create<SystemState>((set) => ({
  isSidebarOpen: true,
  activeHotspotId: null,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setActiveHotspotId: (id) => set({ activeHotspotId: id }),
}));
