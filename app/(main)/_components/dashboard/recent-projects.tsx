"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Video, Play, Trash2, Download } from "lucide-react"
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from "@clerk/nextjs"
import Link from "next/link"

interface RecentProjectsProps {
  className?: string
}

interface VideoItem {
  id: number
  url: string
  prompt: string
  genre: string
  created_at: string
}

export function RecentProjects({ className = "" }: RecentProjectsProps) {
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { userId } = useAuth()

  useEffect(() => {
    async function fetchVideos() {
      if (!userId) return
      
      try {
        setLoading(true)
        
        // Fetch videos from Supabase
        const { data, error } = await supabase
          .from('videos')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5) // Show only the 5 most recent videos
        
        if (error) {
          throw error
        }
        
        setVideos(data || [])
      } catch (err: any) {
        console.error('Error fetching videos:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchVideos()
  }, [userId])

  const handleDelete = async (id: number, filename: string) => {
    if (!userId) return
    
    if (!confirm('Are you sure you want to delete this video?')) {
      return
    }
    
    try {
      // Delete from storage
      const { error: storageError } = await supabase
        .storage
        .from('videos')
        .remove([`${userId}/${filename}`])
      
      if (storageError) {
        console.error('Error deleting from storage:', storageError)
      }
      
      // Delete from database
      const { error: dbError } = await supabase
        .from('videos')
        .delete()
        .eq('id', id)
      
      if (dbError) {
        throw dbError
      }
      
      // Update state to remove the deleted video
      setVideos(videos.filter(video => video.id !== id))
    } catch (err: any) {
      console.error('Error deleting video:', err)
      alert('Failed to delete video: ' + err.message)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  // Function to download a video
  const handleDownload = async (url: string, prompt: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      
      // Create a safe filename
      const filename = prompt
        .substring(0, 30)
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase() + '.mp4'
      
      // Create a download link
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      
      // Append to the document, click, and clean up
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('Error downloading video:', err)
      alert('Failed to download video')
    }
  }

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

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-zinc-500 border-t-zinc-300 rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-zinc-400">
          <p className="text-lg font-medium text-red-400">Error loading videos</p>
          <p className="text-sm mt-1 text-zinc-400">{error}</p>
        </div>
      ) : videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-zinc-400">
          <Video className="w-12 h-12 mb-4 text-zinc-500" />
          <p className="text-lg font-medium text-white">No projects found</p>
          <p className="text-sm mt-1 text-zinc-400">
            Create a new reel to get started.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-800">
          {videos.map((video) => (
            <div key={video.id} className="p-4 hover:bg-zinc-800/30 transition-colors">
              <div className="flex gap-4">
                {/* Video Thumbnail */}
                <div className="relative w-64 h-36 rounded overflow-hidden bg-zinc-900 flex-shrink-0 border border-blue-500">
                <video
                 src={video.url}
                 className="w-full h-full object-cover border border-red-500"
                 poster="/video-placeholder.jpg"
                 muted
                 playsInline
                 preload="metadata"
                 autoPlay
                 controls
                 onLoadedMetadata={() => console.log('✅ Video loaded')}
                 onError={(e) => console.error('❌ Error loading video', e)}
                 />
                </div>
                
                {/* Video Info */}
                <div className="flex-grow">
                  <Link href={`/videos/${video.id}`}>
                    <h3 className="font-medium truncate hover:text-blue-400 transition-colors">
                      {video.prompt.substring(0, 50)}{video.prompt.length > 50 ? '...' : ''}
                    </h3>
                  </Link>
                  <div className="flex items-center text-xs text-zinc-400 mt-1">
                    <span>{video.genre}</span>
                    <span className="mx-2">•</span>
                    <span>{formatDate(video.created_at)}</span>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link 
                    href={`/videos/${video.id}`}
                    className="p-1.5 rounded-full hover:bg-zinc-700 transition-colors"
                    title="View video"
                  >
                    <Play className="w-4 h-4" />
                  </Link>
                  
                  <button
                    onClick={() => handleDownload(video.url, video.prompt)}
                    className="p-1.5 rounded-full hover:bg-zinc-700 transition-colors"
                    title="Download video"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => handleDelete(video.id, video.filename)}
                    className="p-1.5 rounded-full hover:bg-red-900/40 text-red-400 transition-colors"
                    title="Delete video"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {videos.length >= 5 && (
            <div className="p-4 text-center">
              <Link 
                href="/dashboard" 
                className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
              >
                View all videos →
              </Link>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}