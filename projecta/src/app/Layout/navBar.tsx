"use client"

import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { LogoProject } from "../../../public/assets/logo"
import { NotificationCenter } from "@/components/projecta/Notification/notification-center"
import { UserMenu } from "@/components/auth/UserComponents"

interface NavbarProps {
  onMenuClick?: () => void
  showMenuButton?: boolean
}

export function Navbar({ onMenuClick, showMenuButton = false }: NavbarProps) {

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex flex-row justify-between h-16 items-center px-4">
        {/* Mobile Menu Button */}
        {showMenuButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="mr-4 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        <div className="flex items-center">
          <LogoProject className="mr-4" />
        </div>

        <div className="flex items-center space-x-5">
          {/* Notification Center */}
          <div className="relative">
            <NotificationCenter />
          </div>

          {/* User Menu */}
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
