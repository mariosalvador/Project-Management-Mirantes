import { AlertCircle, CheckCircle, Clock, FolderOpen, Pause } from "lucide-react"


export const getProjectIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Clock className="h-3 w-3 text-blue-500" />
      case "completed":
        return <CheckCircle className="h-3 w-3 text-green-500" />
      case "planning":
        return <AlertCircle className="h-3 w-3 text-yellow-500" />
      case "on-hold":
        return <Pause className="h-3 w-3 text-gray-500" />
      default:
        return <FolderOpen className="h-3 w-3" />
    }
  }

  export const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "planning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "on-hold":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }