"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Search, Settings, Menu } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { LogoProject } from "../../../public/assets/logo"
import { NotificationCenter } from "@/components/ui/notification-center"
import { useNotifications } from "@/hooks/useNotifications"

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

        <div className="flex items-center space-x-2">
          <Button asChild size="sm" className="hidden sm:flex">
            <Link href="/projects/new">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Novo Projeto</span>
              <span className="md:hidden">Novo</span>
            </Link>
          </Button>

          {/* Mobile: Only show + icon */}
          <Button asChild size="icon" className="sm:hidden">
            <Link href="/projects/new">
              <Plus className="h-4 w-4" />
            </Link>
          </Button>

          {/* Notification Center */}
          <NotificationCenter />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={"github.com/mariosalvador.png"} alt={"@mariosalvador"} />
                  <AvatarFallback>{"M"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{"Mario Salvador"}</p>
                  <p className="text-xs leading-none text-muted-foreground">{"mariosalvador@github"}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Sair</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
