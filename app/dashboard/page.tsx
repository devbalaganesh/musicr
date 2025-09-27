"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ChevronUp,
  ChevronDown,
  Play,
  Pause,
  Users,
  Clock,
  Music,
  Share2,
} from "lucide-react"
import axios from "axios"

interface QueueItem {
  id: string
  title: string
  artist: string
  thumbnail: string
  duration: string
  votes: number
  submittedBy: string
  youtubeId: string
}

export default function DashboardPage() {
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [videoPreview, setVideoPreview] = useState<QueueItem | null>(null)
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [isPlaying, setIsPlaying] = useState(true)
  const [viewerCount, setViewerCount] = useState(0)

  const REFRESH_INTERVAL_MS =1* 10000

  // Fetch all streams from backend
  const fetchStreams = async () => {
    try {
      const res = await axios.get('/api/streams?createrId', { withCredentials: true })
      if (res.data && Array.isArray(res.data)) {
        setQueue(
          res.data.map((stream: any) => ({
            id: stream.id,
            title: stream.title || "Unknown Title",
            artist: stream.artist || "Unknown Artist",
            thumbnail: stream.thumbnail || "/placeholder.svg",
            duration: stream.duration || "0:00",
            votes: stream.votes || 0,
            submittedBy: stream.submittedBy || "Anonymous",
            youtubeId: stream.youtubeId || "",
          }))
        )
      }
    } catch (error) {
      console.error("Failed to fetch streams:", error)
    }
  }

  useEffect(() => {
    fetchStreams()
    const interval = setInterval(fetchStreams, REFRESH_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount((prev) => Math.max(0, prev + Math.floor(Math.random() * 10) - 5))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const extractYouTubeId = (url: string) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/i
    const match = url.match(regex)
    return match ? match[1] : null
  }

  const handleUrlChange = (url: string) => {
    setYoutubeUrl(url)
    const videoId = extractYouTubeId(url)
    if (videoId) {
      setVideoPreview({
        id: Date.now().toString(),
        title: "New Song",
        artist: "Unknown Artist",
        thumbnail: `/placeholder.svg?height=120&width=120&query=music video thumbnail`,
        duration: "3:30",
        votes: 0,
        submittedBy: "You",
        youtubeId: videoId,
      })
    } else {
      setVideoPreview(null)
    }
  }

  const handleSubmit = async () => {
    if (!videoPreview) return
    try {
      await axios.post(
        "/api/streams/add",
        {
          title: videoPreview.title,
          artist: videoPreview.artist,
          thumbnail: videoPreview.thumbnail,
          duration: videoPreview.duration,
          youtubeId: videoPreview.youtubeId,
        },
        { withCredentials: true }
      )
      await fetchStreams()
      setYoutubeUrl("")
      setVideoPreview(null)
    } catch (error) {
      console.error("Failed to add stream:", error)
    }
  }

  const handleVote = async (id: string, direction: "up" | "down") => {
    try {
      await axios.post(
        "/api/streams/upvote",
        { id, direction },
        { withCredentials: true }
      )
      setQueue((prev) =>
        prev
          .map((item) =>
            item.id === id
              ? { ...item, votes: Math.max(0, item.votes + (direction === "up" ? 1 : -1)) }
              : item
          )
          .sort((a, b) => b.votes - a.votes)
      )
    } catch (error) {
      console.error("Failed to vote:", error)
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: "StreamBeats - Vote for the next song!",
      text: "Join the music queue and vote for your favorite songs!",
      url: window.location.href,
    }
    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(window.location.href)
        alert("Link copied to clipboard!")
      }
    } catch (error) {
      console.error("Error sharing:", error)
    }
  }

  const currentSong = queue[0] || {
    title: "No song playing",
    artist: "",
    youtubeId: "",
    thumbnail: "",
    duration: "0:00",
    votes: 0,
    submittedBy: "",
    id: "",
  }

  const upNext = queue.slice(1).sort((a, b) => b.votes - a.votes)

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center glow-primary">
              <Music className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-balance">StreamBeats</h1>
              <p className="text-sm text-muted-foreground">Community Music Queue</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-accent" />
              <span className="font-mono">{viewerCount.toLocaleString()}</span>
              <span className="text-muted-foreground">viewers</span>
            </div>
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse glow-primary"></div>
            <span className="text-sm font-medium text-primary">LIVE</span>
            <Button
              onClick={handleShare}
              size="sm"
              variant="outline"
              className="border-accent/30 text-accent hover:bg-accent/10 hover:border-accent/50 bg-transparent"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-4 py-8 grid lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Now Playing */}
          <Card className="p-6 bg-card border-border glow-primary">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
              <h2 className="text-lg font-semibold">Now Playing</h2>
            </div>
            <div className="aspect-video bg-muted rounded-lg mb-4 relative overflow-hidden">
              {currentSong.youtubeId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${currentSong.youtubeId}?autoplay=1&controls=0&modestbranding=1`}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  title={currentSong.title}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No song playing
                </div>
              )}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/80 backdrop-blur-sm rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-white text-balance">{currentSong.title}</h3>
                    <p className="text-sm text-gray-300">{currentSong.artist}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="text-white hover:bg-white/20"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>

            {/* Add to Queue */}
            <Card className="p-6 bg-card border-border mt-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Music className="w-5 h-5 text-accent" /> Add to Queue
              </h2>
              <div className="flex gap-3">
                <Input
                  placeholder="Paste YouTube URL..."
                  value={youtubeUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className="flex-1 bg-input border-border"
                  aria-label="YouTube URL input"
                />
                <Button
                  onClick={handleSubmit}
                  disabled={!videoPreview}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground glow-primary"
                >
                  Submit
                </Button>
              </div>
              {videoPreview && (
                <Card className="p-4 bg-muted border-border mt-3 flex gap-3">
                  <img
                    src={videoPreview.thumbnail}
                    alt={videoPreview.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <h4 className="font-medium text-balance">{videoPreview.title}</h4>
                    <p className="text-sm text-muted-foreground">{videoPreview.artist}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" /> {videoPreview.duration}
                    </div>
                  </div>
                </Card>
              )}
            </Card>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Up Next */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Play className="w-5 h-5 text-accent" /> Up Next
              </h2>
              <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30">
                {upNext.length} songs
              </Badge>
            </div>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {upNext.map((item, index) => (
                <Card
                  key={item.id}
                  className="p-4 bg-muted/50 border-border hover:bg-muted/80 transition-colors flex gap-3"
                >
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-balance truncate">{item.title}</h4>
                    <p className="text-xs text-muted-foreground truncate">{item.artist}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      by {item.submittedBy} · {item.duration}
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleVote(item.id, "up")}
                      className="h-6 w-6 p-0 hover:bg-accent/20 hover:text-accent"
                      aria-label={`Upvote ${item.title}`}
                    >
                      <ChevronUp className="w-3 h-3" />
                    </Button>
                    <span className="text-xs font-bold text-accent font-mono">{item.votes}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleVote(item.id, "down")}
                      className="h-6 w-6 p-0 hover:bg-destructive/20 hover:text-destructive"
                      aria-label={`Downvote ${item.title}`}
                    >
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* All Streams */}
            <Card className="p-4 bg-card border-border mt-6">
              <h2 className="text-lg font-semibold mb-4">All Streams</h2>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {queue.map((item, index) => (
                  <Card
                    key={item.id}
                    className="p-3 bg-muted/50 border-border hover:bg-muted/80 transition-colors flex gap-3"
                  >
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-balance truncate">{item.title}</h4>
                      <p className="text-xs text-muted-foreground truncate">{item.artist}</p>
                      <p className="text-xs text-muted-foreground">
                        Submitted by: {item.submittedBy} · {item.duration}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </Card>
        </div>
      </main>
    </div>
  )
}
