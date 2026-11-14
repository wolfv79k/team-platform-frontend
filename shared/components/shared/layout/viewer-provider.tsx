"use client"

import { createContext, useContext } from "react"

import type { Viewer } from "@/services/viewer"
const ViewerContext = createContext<Viewer | null>(null)

export function ViewerProvider({
  viewer,
  children,
}: {
  viewer: Viewer | null
  children: React.ReactNode
}) {
  return <ViewerContext.Provider value={viewer}>{children}</ViewerContext.Provider>
}

export const useViewer = () => useContext(ViewerContext)
