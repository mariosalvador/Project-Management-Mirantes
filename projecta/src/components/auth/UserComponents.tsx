"use client"

import { useAuth } from '@/contexts/AuthContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { LogOut, User, Settings } from 'lucide-react'

export const UserMenu = () => {
  const { user, userData, logout } = useAuth()

  if (!user) return null

  const displayName = userData?.displayName || user.displayName || user.email?.split('@')[0] || 'Usuário'
  const email = user.email || ''
  const photoURL = userData?.photoURL || user.photoURL

  // Iniciais para o avatar
  const initials = displayName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={photoURL || ''} alt={displayName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">{email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Perfil</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Configurações</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const UserInfo = () => {
  const { userData, user } = useAuth()

  if (!user || !userData) return null

  return (
    <div className="bg-card p-4 rounded-lg border">
      <h3 className="font-semibold mb-2">Informações do Usuário</h3>
      <div className="space-y-2 text-sm">
        <div>
          <span className="font-medium">Email:</span> {userData.email}
        </div>
        <div>
          <span className="font-medium">Método de login:</span> {userData.provider === 'google' ? 'Google' : 'Email/Senha'}
        </div>
        <div>
          <span className="font-medium">Membro desde:</span> {userData.createdAt.toLocaleDateString('pt-BR')}
        </div>
        <div>
          <span className="font-medium">Último acesso:</span> {userData.lastLoginAt.toLocaleDateString('pt-BR')} às {userData.lastLoginAt.toLocaleTimeString('pt-BR')}
        </div>
      </div>
    </div>
  )
}
