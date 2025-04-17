"use client"

import { motion } from "framer-motion"
import { Video } from "lucide-react"

interface RecentProjectsProps {
  className?: string
}

const projects: any[] = [] // Set to empty for now

export function RecentProjects({ className = "" }: RecentProjectsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`punk-card ${className}`}
    >
      <div className="p-6 border-b border-zinc-800">
        <h2 className="text-xl font-bold">Recent Projects</h2>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-zinc-400">
          <Video className="w-12 h-12 mb-4 text-zinc-500" />
          <p className="text-lg font-medium text-white">No projects found</p>
          <p className="text-sm mt-1 text-zinc-400">
            Create a new reel to get started.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-800">
         
        </div>
      )}
    </motion.div>
  )
}
