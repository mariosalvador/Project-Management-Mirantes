"use client"

import { CheckCircle, Users, BarChart3, Shield, ArrowRight, Star, Zap, Target } from "lucide-react";
import Link from "next/link";
import { LogoProject } from "../../public/assets/logo";

export default function Home() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <LogoProject />
            <div className="flex items-center gap-4">
              <Link
                href="/auth/login"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Entrar
              </Link>
              <Link
                href="/auth/register"
                className="bg-[#0887cc] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0675b0] transition-colors"
              >
                Começar Agora
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Gerencie seus{" "}
            <span className="text-[#0887cc]">projetos</span>{" "}
            com eficiência
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            O ProJecta é a plataforma completa para gerenciamento de projetos que sua equipe precisa.
            Colabore, organize e entregue resultados extraordinários.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="bg-[#0887cc] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#0675b0] transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              Começar Gratuitamente
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/auth/login"
              className="border-2 border-[#0887cc] text-[#0887cc] px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#0887cc] hover:text-white transition-all"
            >
              Fazer Login
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Recursos poderosos para transformar a forma como sua equipe trabalha
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="bg-[#0887cc]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-[#0887cc]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Gestão de Tarefas</h3>
              <p className="text-gray-600">
                Organize, priorize e acompanhe o progresso de todas as suas tarefas em tempo real.
              </p>
            </div>

            <div className="text-center p-8 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="bg-[#0887cc]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-[#0887cc]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Colaboração em Equipe</h3>
              <p className="text-gray-600">
                Trabalhe em conjunto, compartilhe ideias e mantenha todos alinhados nos objetivos.
              </p>
            </div>

            <div className="text-center p-8 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="bg-[#0887cc]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-[#0887cc]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Relatórios Inteligentes</h3>
              <p className="text-gray-600">
                Visualize métricas importantes e tome decisões baseadas em dados reais.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-r from-[#0887cc] to-[#0675b0]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Por que escolher o ProJecta?
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Benefícios que fazem a diferença no seu dia a dia
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Rápido & Intuitivo</h3>
              <p className="text-blue-100 text-sm">
                Interface moderna e fácil de usar
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">100% Seguro</h3>
              <p className="text-blue-100 text-sm">
                Seus dados protegidos com segurança
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Resultados Comprovados</h3>
              <p className="text-blue-100 text-sm">
                Aumente a produtividade da equipe
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Suporte Premium</h3>
              <p className="text-blue-100 text-sm">
                Ajuda quando você precisar
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Pronto para transformar sua gestão de projetos?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de equipes que já descobriram uma forma melhor de trabalhar.
          </p>
          <Link
            href="/auth/register"
            className="bg-[#0887cc] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#0675b0] transition-all transform hover:scale-105 inline-flex items-center gap-2"
          >
            Começar Agora - É Grátis
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <LogoProject className="mb-4" textClassName="text-white" />
              <p className="text-gray-400 max-w-md">
                O ProJecta é a solução completa para gerenciamento de projetos que sua equipe precisa para alcançar resultados extraordinários.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/auth/register" className="hover:text-white transition-colors">Começar</Link></li>
                <li><Link href="/auth/login" className="hover:text-white transition-colors">Login</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Documentação</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contato</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 ProJecta. Todos os direitos reservados.</p>
            <p>Criado por: {" "}
              <Link href={"https://github.com/maiosalvador"} target="_blank" className={"hover:underline text-white"}>Mário Salvador</Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}