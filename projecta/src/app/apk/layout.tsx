import LayoutWithSidebar from "../Layout/layout-with-sidebar";
import { ProjectProvider } from "../Layout/project-context";

export default function LayoutProvider({ children }: { children: React.ReactNode }) {
  return (
    <ProjectProvider>
      <LayoutWithSidebar>
        {children}
      </LayoutWithSidebar>
    </ProjectProvider>
  )
}