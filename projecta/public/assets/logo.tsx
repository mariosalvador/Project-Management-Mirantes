import { FolderOpen } from "lucide-react"
import Link from "next/link"


interface LogoProjectProps {
  className?: string
  textClassName?: string
  iconClassName?: string
}

export function LogoProject({ className, textClassName }: LogoProjectProps) {
  return (
    <Link href="/" className={`flex items-center space-x-2 ${className}`}>
      <div className="h-8 w-8 bg-[#0887cc] rounded-lg flex items-center justify-center">
        <FolderOpen className="h-4 w-4 text-[#fff]" />
      </div>
      <span className={`font-bold text-lg text-[#0887cc] hidden sm:inline ${textClassName}`}>ProJecta</span>
      <span className={`font-bold text-white sm:hidden ${textClassName}`}>PJ</span>
    </Link>
  )
}