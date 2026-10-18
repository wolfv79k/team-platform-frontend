import { create } from "zustand";

interface ProfileSidebarState {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const useProfileSidebarStore =
  create<ProfileSidebarState>((set) => ({
    isOpen: false,

    setIsOpen: (isOpen) => set({ isOpen }),
  }));