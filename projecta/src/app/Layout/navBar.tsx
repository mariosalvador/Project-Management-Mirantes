"use client"

import { Button } from "@/components/ui/button"
import { Search, Menu } from "lucide-react"
import { Input } from "@/components/ui/input"
import { LogoProject } from "../../../public/assets/logo"
import { NotificationCenter } from "@/components/projecta/Notification/notification-center"
import { useNotifications } from "@/hooks/useNotifications"
import { UserMenu } from "@/components/auth/UserComponents"

interface NavbarProps {
  onMenuClick?: () => void
  showMenuButton?: boolean
}

export function Navbar({ onMenuClick, showMenuButton = false }: NavbarProps) {
  const { stats } = useNotifications();
  console.log("Navbar stats:", stats);

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
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

        <div className="flex flex-1 items-center space-x-2">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar projetos..."
                className="pl-8 w-full md:w-[250px] lg:w-[350px] xl:w-[400px]"
              />
            </div>
          </div>
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
