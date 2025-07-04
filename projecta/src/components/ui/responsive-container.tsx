import { cn } from "@/lib/utils"

interface ResponsiveContainerProps {
  children: React.ReactNode
  className?: string
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"
}

export function ResponsiveContainer({
  children,
  className,
  maxWidth = "full"
}: ResponsiveContainerProps) {
  const maxWidthClasses = {
    sm: "max-w-screen-sm",     // 640px
    md: "max-w-screen-md",     // 768px
    lg: "max-w-screen-lg",     // 1024px
    xl: "max-w-screen-xl",     // 1280px
    "2xl": "max-w-screen-2xl", // 1536px
    full: "max-w-full"
  }

  return (
    <div className={cn(
      "w-full mx-auto",
      "px-4 sm:px-6 lg:px-8", // Responsivo padding horizontal
      maxWidthClasses[maxWidth],
      className
    )}>
      {children}
    </div>
  )
}

// Componente especializado para seções da página
interface PageSectionProps {
  children?: React.ReactNode
  className?: string
  title?: string
  description?: string
  action?: React.ReactNode
}

export function PageSection({
  children,
  className,
  title,
  description,
  action
}: PageSectionProps) {
  return (
    <section className={cn("space-y-6", className)}>
      {(title || description || action) && (
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="space-y-1">
            {title && (
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {action && (
            <div className="flex-shrink-0">
              {action}
            </div>
          )}
        </div>
      )}
      {children}
    </section>
  )
}
