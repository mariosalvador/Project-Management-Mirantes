import Link from "next/link"


interface LogoProjectProps {
  className?: string
  textClassName?: string
  iconClassName?: string
}

export function LogoProject({ className, textClassName, iconClassName }: LogoProjectProps) {
  return (
    <Link href="/" className={`flex items-center space-x-2 ${className}`}>
      <div className={`h-6 w-6 bg-primary rounded ${iconClassName}`} />
      <span className={`font-bold text-lg hidden sm:inline ${textClassName}`}>ProJecta</span>
      <span className={`font-bold text-base sm:hidden ${textClassName}`}>PJ</span>
    </Link>
  )
}