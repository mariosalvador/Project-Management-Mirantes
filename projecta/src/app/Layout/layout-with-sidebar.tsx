"use client"

import type React from "react"
import { useState } from "react"
import { Sidebar } from "./sidebar"
import { Navbar } from "./navBar"
import { useIsMobile } from "@/lib/use-media-query"
import { NotificationToastProvider } from "@/components/projecta/Notification/notification-toast-provider"
import { PermissionProvider } from "@/hooks/usePermissions"
import { ActivityProvider } from "@/hooks/useActivity"
import { WelcomeWithInvites } from "@/components/projecta/Notification/welcome-with-invites"

interface LayoutWithSidebarProps {
  children: React.ReactNode
}

export default function LayoutWithSidebar({ children }: LayoutWithSidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const isMobile = useIsMobile()

  return (
    <PermissionProvider>
      <ActivityProvider>
        <NotificationToastProvider>
          <div className="flex h-screen overflow-hidden bg-background">
            {/* Sidebar Desktop */}
            {!isMobile && <Sidebar />}

            {/* Sidebar Mobile - Overlay */}
            {isMobile && (
              <>
                {/* Backdrop */}
                {isMobileMenuOpen && (
                  <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                )}

                {/* Mobile Sidebar */}
                <div
                  className={`fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out lg:hidden ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
                >
                  <Sidebar className="h-full" />
                </div>
              </>
            )}

            <div className="flex-1 flex flex-col overflow-hidden">
              <Navbar
                onMenuClick={() => setIsMobileMenuOpen(true)}
                showMenuButton={isMobile}
              />
              <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">{children}</main>
            </div>
          </div>

          {/* Componente de boas-vindas com convites */}
          <WelcomeWithInvites />
        </NotificationToastProvider>
      </ActivityProvider>
    </PermissionProvider>
  )
}
