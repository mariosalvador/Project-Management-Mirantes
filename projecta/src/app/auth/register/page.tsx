"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { LogoProject } from "../../../../public/assets/logo"
import { signUp, checkUserExists } from "@/Api/services/auth"
import { PublicRoute } from "@/components/auth/RouteProtection"
import { validateRegistrationForm, validateEmail, handleFirebaseAuthError, getSuccessMessage } from "@/utils/authValidation"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [emailError, setEmailError] = useState("")
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const router = useRouter()

  const handleEmailBlur = async () => {
    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || "Email inválido")
      return
    }

    if (email && email.includes('@')) {
      setIsCheckingEmail(true)
      setEmailError("")

      try {
        const exists = await checkUserExists(email)
        if (exists) {
          setEmailError("Este email já está cadastrado. Tente fazer login.")
        }
      } catch (error) {
        console.error('Erro ao verificar email:', error)
        setEmailError("Erro ao verificar email. Tente novamente.")
      } finally {
        setIsCheckingEmail(false)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    if (emailError) {
      setError("Corrija os erros antes de continuar.")
      setIsLoading(false)
      return
    }

    const validation = validateRegistrationForm(name, email, password, confirmPassword)
    if (!validation.isValid) {
      setError(validation.error || "Dados inválidos")
      setIsLoading(false)
      return
    }

    try {
      const user = await signUp(email, password);

      if (user) {
        const successMessage = getSuccessMessage('register')
        setSuccess(successMessage)
        setTimeout(() => {
          router.push("/auth/login")
        }, 2000)
      }
    } catch (err: unknown) {
      console.error("Registration error:", err)
      const errorMessage = handleFirebaseAuthError(err)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PublicRoute>
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <LogoProject />
            <CardTitle className="text-2xl text-center">Criar Conta</CardTitle>
            <CardDescription className="text-center">Crie sua conta para começar a gerenciar projetos</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setEmailError("") // Limpar erro ao digitar
                  }}
                  onBlur={handleEmailBlur}
                  required
                />
                {isCheckingEmail && (
                  <p className="text-xs text-muted-foreground">Verificando email...</p>
                )}
                {emailError && (
                  <p className="text-xs text-red-600">{emailError}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar Conta
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              Já tem uma conta?{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                Entrar
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicRoute>
  )
}
