"use client"

import { useState, useEffect } from "react"

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }

    const listener = () => setMatches(media.matches)
    window.addEventListener("resize", listener)

    return () => window.removeEventListener("resize", listener)
  }, [matches, query])

  return matches
}

// Breakpoints personalizados
export const breakpoints = {
  sm: "640px",    // Telefone
  md: "768px",    // Tablet
  lg: "1024px",   // Laptop
  xl: "1280px",   // Desktop
} as const

// Hooks para diferentes tamanhos de tela
export function useIsMobile() {
  return useMediaQuery(`(max-width: ${breakpoints.md})`)
}

export function useIsTablet() {
  return useMediaQuery(`(min-width: ${breakpoints.md}) and (max-width: ${breakpoints.lg})`)
}

export function useIsLaptop() {
  return useMediaQuery(`(min-width: ${breakpoints.lg}) and (max-width: ${breakpoints.xl})`)
}

export function useIsDesktop() {
  return useMediaQuery(`(min-width: ${breakpoints.xl})`)
}
