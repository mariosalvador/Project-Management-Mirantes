import LayoutWithSidebar from "../Layout/layout-with-sidebar";
import { ProjectProvider } from "../Layout/project-context";
import { ProtectedRoute } from "@/components/auth/RouteProtection";

export default function LayoutProvider({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <ProjectProvider>
        <LayoutWithSidebar>
          {children}
        </LayoutWithSidebar>
      </ProjectProvider>
    </ProtectedRoute>
  )
}