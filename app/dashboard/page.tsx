"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronUp, ChevronDown, Play, Pause, Volume2, Users, Clock, Music, Share2 } from "lucide-react"
import axios from 'axios'
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

const REFRESH_INTERVAL_MS=10*1000;

export default function MusicVotingApp() {
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [videoPreview, setVideoPreview] = useState<any>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [currentTime, setCurrentTime] = useState("2:34")
  const [totalTime, setTotalTime] = useState("4:12")
  const [viewerCount, setViewerCount] = useState(1247)

  // Mock current playing song
  const currentSong = {
    title: "Neon Dreams",
    artist: "Synthwave Collective",
    thumbnail: "/synthwave-neon-music-album-cover.jpg",
    youtubeId: "dQw4w9WgXcQ",
  }

  // Mock queue data
  const [queue, setQueue] = useState<QueueItem[]>([
    {
      id: "1",
      title: "Electric Pulse",
      artist: "Cyber Beats",
      thumbnail: "/electronic-music-album-cover.png",
      duration: "3:45",
      votes: 23,
      submittedBy: "StreamFan42",
      youtubeId: "abc123",
    },
    {
      id: "2",
      title: "Digital Horizon",
      artist: "Future Sound",
      thumbnail: "/futuristic-music-album-cover.jpg",
      duration: "4:20",
      votes: 18,
      submittedBy: "MusicLover99",
      youtubeId: "def456",
    },
    {
      id: "3",
      title: "Retro Wave",
      artist: "Nostalgic Vibes",
      thumbnail: "/retro-wave-music-album-cover.jpg",
      duration: "3:12",
      votes: 15,
      submittedBy: "VintageBeats",
      youtubeId: "ghi789",
    },
    {
      id: "4",
      title: "Bass Drop",
      artist: "Heavy Synth",
      thumbnail: "/bass-heavy-electronic-music.jpg",
      duration: "2:58",
      votes: 12,
      submittedBy: "BassHead",
      youtubeId: "jkl012",
    },
  ])

  const extractYouTubeId = (url: string) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  const handleUrlChange = (url: string) => {
    setYoutubeUrl(url)
    const videoId = extractYouTubeId(url)
    if (videoId) {
      // Mock video preview data
      setVideoPreview({
        id: videoId,
        title: "Amazing Song Title",
        artist: "Cool Artist",
        thumbnail: `/placeholder.svg?height=120&width=120&query=music video thumbnail`,
        duration: "3:30",
      })
    } else {
      setVideoPreview(null)
    }
  }

useEffect(() => {
  async function refreshStreams() {
    try {
      const res = await axios.get('/api/streams/my',{
        withCredentials:true
      })
      console.log(res.data)
    
    } catch (err) {
      console.error('Failed to fetch streams:', err)
    }
  }

  refreshStreams()
  const interval = setInterval(refreshStreams, REFRESH_INTERVAL_MS)
  return () => clearInterval(interval)
}, [])

 
  const handleVote = (id: string, direction: "up" | "down") => {
  // 1. Update the local queue
  setQueue((prev) => {
    // Update the votes for the specific item
    const updatedQueue = prev.map((item) => {
      if (item.id === id) {
        const voteChange = direction === "up" ? 1 : -1;
        return { ...item, votes: item.votes + voteChange };
      }
      return item;
    });

    // Sort the queue so items with more votes come first
    updatedQueue.sort((a, b) => b.votes - a.votes);

    return updatedQueue;
  });

  // 2. Send the vote to the server
  fetch("/api/strems/upvotes", {
    method: "POST", // always specify method
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ streamId: id }),
  });
};


  const handleSubmit = () => {
    if (videoPreview) {
      const newItem: QueueItem = {
        id: Date.now().toString(),
        title: videoPreview.title,
        artist: videoPreview.artist,
        thumbnail: videoPreview.thumbnail,
        duration: videoPreview.duration,
        votes: 1,
        submittedBy: "You",
        youtubeId: videoPreview.id,
      }
      setQueue((prev) => [...prev, newItem].sort((a, b) => b.votes - a.votes))
      setYoutubeUrl("")
      setVideoPreview(null)
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: "StreamBeats - Vote for the next song!",
      text: "Join the music queue and vote for your favorite songs on this stream!",
      url: window.location.href,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href)
        // You could add a toast notification here
        alert("Link copied to clipboard!")
      }
    } catch (error) {
      console.error("Error sharing:", error)
    }
  }

  // Simulate viewer count changes
  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount((prev) => prev + Math.floor(Math.random() * 10) - 5)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
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
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Player */}
          <div className="lg:col-span-2 space-y-6">
            {/* Now Playing */}
            <Card className="p-6 bg-card border-border glow-primary">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
                <h2 className="text-lg font-semibold">Now Playing</h2>
              </div>

              <div className="aspect-video bg-muted rounded-lg mb-4 relative overflow-hidden">
                <iframe
                  src={`https://www.youtube.com/embed/${currentSong.youtubeId}?autoplay=1&controls=0&modestbranding=1`}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-black/80 backdrop-blur-sm rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
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
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <span className="font-mono">{currentTime}</span>
                      <div className="flex-1 h-1 bg-gray-600 rounded-full overflow-hidden">
                        <div className="w-1/3 h-full bg-primary rounded-full"></div>
                      </div>
                      <span className="font-mono">{totalTime}</span>
                      <Volume2 className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Submit New Song */}
            <Card className="p-6 bg-card border-border">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Music className="w-5 h-5 text-accent" />
                Add to Queue
              </h2>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <Input
                    placeholder="Paste YouTube URL here..."
                    value={youtubeUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    className="flex-1 bg-input border-border"
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
                  <Card className="p-4 bg-muted border-border">
                    <div className="flex gap-3">
                      <img
                        src={videoPreview.thumbnail || "/placeholder.svg"}
                        alt={videoPreview.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-balance">{videoPreview.title}</h4>
                        <p className="text-sm text-muted-foreground">{videoPreview.artist}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground font-mono">{videoPreview.duration}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </Card>
          </div>

          {/* Queue Sidebar */}
          <div className="space-y-6">
            <Card className="p-6 bg-card border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Up Next</h2>
                <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30">
                  {queue.length} songs
                </Badge>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {queue.map((item, index) => (
                  <Card key={item.id} className="p-4 bg-muted/50 border-border hover:bg-muted/80 transition-colors">
                    <div className="flex gap-3">
                      <div className="relative">
                        <img
                          src={item.thumbnail || "/placeholder.svg"}
                          alt={item.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="absolute -top-1 -left-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground">
                          {index + 1}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-balance truncate">{item.title}</h4>
                        <p className="text-xs text-muted-foreground truncate">{item.artist}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">by {item.submittedBy}</span>
                          <span className="text-xs text-muted-foreground font-mono">{item.duration}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleVote(item.id, "up")}
                          className="h-6 w-6 p-0 hover:bg-accent/20 hover:text-accent"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </Button>
                        <span className="text-xs font-bold text-accent font-mono">{item.votes}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleVote(item.id, "down")}
                          className="h-6 w-6 p-0 hover:bg-destructive/20 hover:text-destructive"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
