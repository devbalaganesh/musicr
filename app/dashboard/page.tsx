"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronUp, ChevronDown, Play, Pause, Users, Clock, Music } from "lucide-react"
import axios from "axios"
import YouTube from "react-youtube-embed";interface QueueItem {
  id: string
  title: string
  artist: string
  thumbnail: string
  duration: string
  votes: number
  videoId: string
  submittedBy: string
  hasVoted?: "up" | "down" | null
}

interface VideoPreview {
  id: string
  title: string
  artist: string
  thumbnail: string
  duration: string
}

export default function MusicVotingApp() {
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [videoPreview, setVideoPreview] = useState<VideoPreview | null>(null)
  const [currentPlaying, setCurrentPlaying] = useState<QueueItem | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStreams()
  }, [])

  const fetchStreams = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await axios.get("/api/streams/my")
      let streamsData: QueueItem[] = []

      if (Array.isArray(response.data)) streamsData = response.data
      else if (response.data?.streams) streamsData = response.data.streams
      else if (response.data?.data) streamsData = response.data.data
      else {
        streamsData = [
          {
            id: "1",
            title: "Bohemian Rhapsody",
            artist: "Queen",
            thumbnail: "/queen-bohemian-rhapsody-album-cover.png",
            duration: "5:55",
            votes: 42,
            videoId: "fJ9rUzIMcZQ",
            submittedBy: "MusicLover92",
            hasVoted: null,
          },
          {
            id: "2",
            title: "Stairway to Heaven",
            artist: "Led Zeppelin",
            thumbnail: "/led-zeppelin-stairway-to-heaven-album-cover.jpg",
            duration: "8:02",
            votes: 38,
            videoId: "QkF3oxziUI4",
            submittedBy: "RockFan2000",
            hasVoted: null,
          },
        ]
      }

      setQueue(streamsData.sort((a, b) => b.votes - a.votes))
    } catch (err) {
      console.error("Failed to fetch streams:", err)
      setError("Failed to load streams. Using demo data.")
      setQueue([
        {
          id: "1",
          title: "Bohemian Rhapsody",
          artist: "Queen",
          thumbnail: "/queen-bohemian-rhapsody-album-cover.png",
          duration: "5:55",
          votes: 42,
          videoId: "fJ9rUzIMcZQ",
          submittedBy: "MusicLover92",
          hasVoted: null,
        },
        {
          id: "2",
          title: "Stairway to Heaven",
          artist: "Led Zeppelin",
          thumbnail: "/led-zeppelin-stairway-to-heaven-album-cover.jpg",
          duration: "8:02",
          votes: 38,
          videoId: "QkF3oxziUI4",
          submittedBy: "RockFan2000",
          hasVoted: null,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!currentPlaying && queue.length > 0) setCurrentPlaying(queue[0])
  }, [queue, currentPlaying])

  const extractVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex)
    return match ? match[1] : null
  }

  const handleUrlChange = (url: string) => {
    setYoutubeUrl(url)
    const videoId = extractVideoId(url)
    if (videoId) {
      setVideoPreview({
        id: videoId,
        title: "Sample Video Title",
        artist: "Sample Artist",
        thumbnail: `/placeholder.svg?height=120&width=120&query=youtube video thumbnail`,
        duration: "3:45",
      })
    } else setVideoPreview(null)
  }

const handleSubmitSong = async () => {
  if (!youtubeUrl) return;

  // Extract video ID
  const videoId = extractVideoId(youtubeUrl);
  if (!videoId) {
    alert("Invalid YouTube URL");
    return;
  }

try {
    const response = await fetch("/api/streams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        createrId: userId,   // ✅ must match schema
        url: youtubeUrl,     // backend extracts videoId itself
      }),
    });
    if (!response.ok) throw new Error("Failed to submit song");

    const updatedQueue: QueueItem[] = await response.json();
    setQueue(updatedQueue.sort((a, b) => b.votes - a.votes));
    setYoutubeUrl("");
    setVideoPreview(null);
  } catch (err) {
    console.error("Failed to submit song:", err);
    alert("Failed to submit the song. Please try again.");
  }
};


  const handleVote = async (streamID: string, voteType: "up" | "down") => {
    try {
      const endpoint = voteType === "up" ? "/api/streams/upvotes" : "/api/streams/downvotes"
      await axios.post(endpoint, { streamID })

      setQueue((prev) =>
        prev
          .map((song) => {
            if (song.id === streamID) {
              let newVotes = song.votes
              let newHasVoted: "up" | "down" | null = voteType

              if (song.hasVoted === voteType) {
                newVotes += voteType === "up" ? -1 : 1
                newHasVoted = null
              } else if (song.hasVoted) {
                newVotes += voteType === "up" ? 2 : -2
              } else {
                newVotes += voteType === "up" ? 1 : -1
              }

              return { ...song, votes: newVotes, hasVoted: newHasVoted }
            }
            return song
          })
          .sort((a, b) => b.votes - a.votes)
      )
    } catch (err) {
      console.error(`Failed to ${voteType}vote:`, err)
    }
  }

  const playNext = () => {
    const index = queue.findIndex((s) => s.id === currentPlaying?.id)
    if (index < queue.length - 1) setCurrentPlaying(queue[index + 1])
  }

  const playPrevious = () => {
    const index = queue.findIndex((s) => s.id === currentPlaying?.id)
    if (index > 0) setCurrentPlaying(queue[index - 1])
  }

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading streams...</p>
        </div>
      </div>
    )

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b sticky top-0 bg-card p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Music className="w-6 h-6" />
          <h1 className="text-xl font-bold">StreamBeats</h1>
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" /> 1,247 listeners
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" /> Live
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Now Playing */}
          {currentPlaying && (
            <Card className="p-6 bg-card border border-border">
              <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-4">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${currentPlaying.videoId}?autoplay=${isPlaying ? 1 : 0}`}
                  title={currentPlaying.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{currentPlaying.title}</h3>
                  <p className="text-sm text-muted-foreground">{currentPlaying.artist}</p>
                  <p className="text-xs text-muted-foreground">Submitted by {currentPlaying.submittedBy}</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={playPrevious} size="sm">Previous</Button>
                  <Button onClick={() => setIsPlaying(!isPlaying)} size="sm">
                    {isPlaying ? <Pause /> : <Play />}
                  </Button>
                  <Button onClick={playNext} size="sm">Next</Button>
                </div>
              </div>
            </Card>
          )}

          {/* Submit Song */}
          <Card className="p-6 bg-card border border-border">
            <h2 className="text-lg font-semibold mb-4">Submit a Song</h2>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="YouTube URL"
                value={youtubeUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
              />
              <Button onClick={handleSubmitSong} disabled={!videoPreview}>Submit</Button>
            </div>
            {videoPreview && (
              <div className="flex items-center gap-4 p-2 bg-muted rounded-lg">
                <img src={videoPreview.thumbnail} alt={videoPreview.title} className="w-16 h-16 object-cover rounded" />
                <div>
                  <p className="font-medium">{videoPreview.title}</p>
                  <p className="text-sm text-muted-foreground">{videoPreview.artist}</p>
                  <p className="text-xs text-muted-foreground">{videoPreview.duration}</p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Queue */}
        <div className="space-y-4">
          <Card className="p-6 bg-card border border-border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-lg">Queue</h2>
              <Badge>{queue.length} songs</Badge>
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {queue.map((song, idx) => (
                <div
                  key={song.id}
                  className={`flex items-center gap-2 p-2 rounded-lg ${
                    currentPlaying?.id === song.id ? "bg-primary/10" : "bg-muted/50 hover:bg-muted"
                  }`}
                >
                  <div className="w-6 h-6 flex items-center justify-center text-xs font-medium">{idx + 1}</div>
                  <img src={song.thumbnail} alt={song.title} className="w-12 h-12 object-cover rounded" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{song.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{song.artist}</p>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote(song.id, "up")}
                      className={song.hasVoted === "up" ? "text-primary" : "text-muted-foreground"}
                    >
                      <ChevronUp />
                    </Button>
                    <span className={`${song.votes > 0 ? "text-green-400" : song.votes < 0 ? "text-red-400" : "text-muted-foreground"}`}>
                      {song.votes}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote(song.id, "down")}
                      className={song.hasVoted === "down" ? "text-destructive" : "text-muted-foreground"}
                    >
                      <ChevronDown />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
