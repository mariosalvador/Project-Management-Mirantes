import { Button } from "@/components/ui/button"
import { Plus, Search, Users, Target, Calendar } from "lucide-react"
import Link from "next/link"

interface EmptyStateProps {
  type: "initial" | "search"
  searchTerm?: string
  onClearFilters?: () => void
}

export function EmptyState({ type, onClearFilters }: EmptyStateProps) {
  if (type === "search") {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Search className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">Nenhum projeto encontrado</h3>
        <p className="text-muted-foreground mb-4">
          Não encontramos projetos com os filtros aplicados. Tente ajustar sua busca.
        </p>
        <div className="flex justify-center gap-2">
          <Button variant="outline" onClick={onClearFilters}>
            Limpar Filtros
          </Button>
          <Link href="/apk/project/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Criar Novo Projeto
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="text-center py-16">
      <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
        <svg
          className="w-12 h-12 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">
        Bem-vindo ao Projecta!
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Você ainda não tem projetos. Comece criando seu primeiro projeto para organizar suas tarefas e colaborar com sua equipe.
      </p>
      <Link href="/apk/project/create">
        <Button size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Criar Meu Primeiro Projeto
        </Button>
      </Link>

      {/* Dicas rápidas */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div className="text-center p-4 border rounded-lg bg-card">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <h4 className="font-medium mb-2">Colabore em Equipe</h4>
          <p className="text-sm text-muted-foreground">
            Adicione membros, atribua tarefas e acompanhe o progresso juntos
          </p>
        </div>
        <div className="text-center p-4 border rounded-lg bg-card">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Target className="h-6 w-6 text-green-600" />
          </div>
          <h4 className="font-medium mb-2">Organize Tarefas</h4>
          <p className="text-sm text-muted-foreground">
            Crie tarefas, defina prazos e acompanhe marcos importantes
          </p>
        </div>
        <div className="text-center p-4 border rounded-lg bg-card">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Calendar className="h-6 w-6 text-purple-600" />
          </div>
          <h4 className="font-medium mb-2">Acompanhe Progresso</h4>
          <p className="text-sm text-muted-foreground">
            Visualize relatórios e mantenha tudo sob controle
          </p>
        </div>
      </div>
    </div>
  )
}
