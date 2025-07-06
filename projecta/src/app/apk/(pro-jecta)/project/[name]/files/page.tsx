"use client";

import { useParams } from "next/navigation";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { FileManager } from "@/components/projecta/File/file-manager";
import { useProjectByTitle } from "@/hooks/useProjects";
import { ArrowLeft, FolderOpen, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ProjectFilesPage() {
  const { name } = useParams<{ name: string }>();
  const decodedName = decodeURIComponent(name);
  const { project, loading, error, refreshProject } = useProjectByTitle(decodedName);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <RefreshCw className="h-12 w-12 text-muted-foreground mb-4 animate-spin" />
        <h2 className="text-xl font-semibold mb-2">Carregando projeto...</h2>
        <p className="text-muted-foreground">
          Buscando informações do projeto &quot;{decodedName}&quot;
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Erro ao carregar projeto</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <div className="flex gap-2">
          <Button onClick={refreshProject}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
          <Link href="/apk/project">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos Projetos
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Projeto não encontrado</h2>
        <p className="text-muted-foreground mb-4">
          O projeto que você está procurando não existe ou foi removido.
        </p>
        <Link href="/apk/project">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar aos Projetos
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb
          items={[
            { label: "Projetos", href: "/apk/project" },
            { label: project.title, href: `/apk/project/${encodeURIComponent(project.title)}` },
            { label: "Arquivos" }
          ]}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href={`/apk/project/${encodeURIComponent(project.title)}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Arquivos do Projeto</h1>
            <p className="text-muted-foreground">
              Gerencie os arquivos e documentos de <strong>{project.title}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* File Manager */}
      <FileManager
        projectId={project.id}
        projectTitle={project.title}
        className="max-w-none"
      />
    </div>
  );
}
