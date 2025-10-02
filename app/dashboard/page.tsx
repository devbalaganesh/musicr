"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronUp, ChevronDown, Play, Pause, Users, Clock, Music } from "lucide-react";
import axios from "axios";

// Define the structure of each queue item
interface QueueItem {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: string;
  votes: number;
  videoId: string;
  submittedBy: string;
  hasVoted?: "up" | "down" | null;
}

// Polyfill for axios.fetch to mimic fetch-like interface using Axios under the hood
if (!(axios as any).fetch) {
  (axios as any).fetch = async (url: string, init?: RequestInit & { data?: any }) => {
    const method = (init?.method || "GET").toUpperCase();
    try {
      if (method === "GET") {
        const res = await axios.get(url);
        return { ok: res.status >= 200 && res.status < 300, status: res.status, json: async () => res.data };
      } else {
        const data = init?.body ? JSON.parse(init.body as string) : init?.data;
        const res = await axios({ url, method, data, headers: init?.headers });
        return { ok: res.status >= 200 && res.status < 300, status: res.status, json: async () => res.data };
      }
    } catch (error: any) {
      const status = error?.response?.status ?? 500;
      return { ok: false, status, json: async () => ({ error: true, message: error?.message }) };
    }
  };
}

export default function MusicVotingApp() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [videoPreview, setVideoPreview] = useState<any>(null);
  const [currentPlaying, setCurrentPlaying] = useState<QueueItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the queue on mount
  useEffect(() => {
    fetchStreams();
  }, []);

  // Fetch function for the song queue
  const fetchStreams = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res: any = await (axios as any).fetch("/api/streams/my", { method: "GET" });
      if ("ok" in res && res.ok === false) {
        throw Object.assign(new Error("Fetch failed"), { status: (res as any).status });
      }
      const responseData =
        "json" in res && typeof (res as any).json === "function" ? await (res as any).json() : (res as any).data;

      let streamsData: any[] = [];
      if (Array.isArray(responseData)) {
        streamsData = responseData;
      } else if (responseData && Array.isArray((responseData as any).streams)) {
        streamsData = (responseData as any).streams;
      } else if (responseData && Array.isArray((responseData as any).data)) {
        streamsData = (responseData as any).data;
      } else {
        throw new Error("Invalid response format from API");
      }

      const sortedStreams = streamsData.sort((a: QueueItem, b: QueueItem) => b.votes - a.votes);
      setQueue(sortedStreams);
    } catch (err) {
      setError("Failed to load streams from API. Please ensure the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  // Whenever the queue or currentPlaying changes, sync the current playing song (if not already set)
  useEffect(() => {
    if (!currentPlaying && queue.length > 0) {
      setCurrentPlaying(queue[0]);
    }
  }, [queue, currentPlaying]);

  // Helper: Extract YouTube video ID
  const extractVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // On YouTube URL input change: try to extract and build a preview
  const handleUrlChange = async (url: string) => {
    setYoutubeUrl(url);
    const videoId = extractVideoId(url);

    if (videoId) {
      // In production, fetch actual metadata from YouTube Data API here
      setVideoPreview({
        id: videoId,
        title: "Sample Video Title",
        artist: "Sample Artist",
        thumbnail: `/placeholder.svg?height=120&width=120&query=youtube video thumbnail`,
        duration: "3:45",
      });
    } else {
      setVideoPreview(null);
    }
  };

  // Submit a new song from the preview (local-only, replace with API call for production)
  const handleSubmitSong = () => {
    if (videoPreview) {
      const newSong: QueueItem = {
        id: Date.now().toString(),
        title: videoPreview.title,
        artist: videoPreview.artist,
        thumbnail: videoPreview.thumbnail,
        duration: videoPreview.duration,
        votes: 0,
        videoId: videoPreview.id,
        submittedBy: "You",
        hasVoted: null,
      };

      setQueue((prev) => [...prev, newSong].sort((a, b) => b.votes - a.votes));
      setYoutubeUrl("");
      setVideoPreview(null);
    }
  };

  // Voting handler: upvote or downvote a given song
 const handleVote = async (songId: string, voteType: "up" | "down") => {
  try {
    const endpoint =
      voteType === "up" ? "/api/streams/upvotes" : "/api/streams/downvotes";

    console.log(`[v0] Sending ${voteType}vote for song ${songId} to ${endpoint}`);

    // Send vote to API with correct key
    await axios.post(endpoint, { streamId: songId });  // ✅ must match Zod schema

    console.log(`[v0] ${voteType}vote successful`);

    // Update local state optimistically...
    setQueue((prev) =>
      prev
        .map((song) => {
          if (song.id === songId) {
            let newVotes = song.votes;
            let newHasVoted: "up" | "down" | null = voteType;

            if (song.hasVoted === voteType) {
              newVotes += voteType === "up" ? -1 : 1;
              newHasVoted = null;
            } else if (song.hasVoted) {
              newVotes += voteType === "up" ? 2 : -2;
            } else {
              newVotes += voteType === "up" ? 1 : -1;
            }

            return { ...song, votes: newVotes, hasVoted: newHasVoted };
          }
          return song;
        })
        .sort((a, b) => b.votes - a.votes)
    );
  } catch (err) {
    console.error(`[v0] Failed to ${voteType}vote:`, err);
  }
};


  // Player controls: advance to next/previous in queue
  const playNext = () => {
    const currentIndex = queue.findIndex((song) => song.id === currentPlaying?.id);
    if (currentIndex < queue.length - 1) {
      setCurrentPlaying(queue[currentIndex + 1]);
    }
  };

  const playPrevious = () => {
    const currentIndex = queue.findIndex((song) => song.id === currentPlaying?.id);
    if (currentIndex > 0) {
      setCurrentPlaying(queue[currentIndex - 1]);
    }
  };

  // Loading UI
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading streams...</p>
        </div>
      </div>
    );
  }

  // Error UI
  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchStreams} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Main App UI
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Music className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-balance">StreamBeats</h1>
                <p className="text-sm text-muted-foreground">Community Music Voting</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>1,247 listeners</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Live</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Currently Playing */}
            <Card className="p-6 bg-card border-border">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                <h2 className="text-xl font-semibold">Now Playing</h2>
              </div>
              {currentPlaying && (
                <div className="space-y-6">
                  {/* YouTube Embed */}
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${currentPlaying.videoId}?autoplay=${isPlaying ? 1 : 0}`}
                      title={currentPlaying.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>

                  {/* Player Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-balance">{currentPlaying.title}</h3>
                      <p className="text-muted-foreground">{currentPlaying.artist}</p>
                      <p className="text-sm text-muted-foreground">Submitted by {currentPlaying.submittedBy}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="sm" onClick={playPrevious}>
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-12 h-12 rounded-full"
                      >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      </Button>
                      <Button variant="outline" size="sm" onClick={playNext}>
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Submit New Song */}
            <Card className="p-6 bg-card border-border">
              <h2 className="text-xl font-semibold mb-6">Submit a Song</h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Input
                    placeholder="Paste YouTube URL here..."
                    value={youtubeUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    className="flex-1 bg-input border-border"
                  />
                  <Button
                    onClick={handleSubmitSong}
                    disabled={!videoPreview}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Submit
                  </Button>
                </div>
                {videoPreview && (
                  <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                    <img
                      src={videoPreview.thumbnail || "/placeholder.svg"}
                      alt={videoPreview.title}
                      className="w-16 h-16 rounded-md object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-balance">{videoPreview.title}</h4>
                      <p className="text-sm text-muted-foreground">{videoPreview.artist}</p>
                      <p className="text-sm text-muted-foreground">{videoPreview.duration}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Queue Sidebar */}
          <div className="space-y-6">
            <Card className="p-6 bg-card border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Queue</h2>
                <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                  {queue.length} songs
                </Badge>
              </div>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {queue.map((song, index) => (
                  <div
                    key={song.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      currentPlaying?.id === song.id
                        ? "bg-primary/10 border border-primary/20"
                        : "bg-muted/50 hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center justify-center w-8 h-8 bg-secondary rounded-full text-sm font-medium">
                      {index + 1}
                    </div>
                    <img
                      src={song.thumbnail || "/placeholder.svg"}
                      alt={song.title}
                      className="w-12 h-12 rounded-md object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-balance truncate">{song.title}</h4>
                      <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                      <p className="text-xs text-muted-foreground">{song.duration}</p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote(song.id, "up")}
                        className={`w-8 h-8 p-0 ${song.hasVoted === "up" ? "text-primary" : "text-muted-foreground"}`}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </Button>
                      <span
                        className={`text-sm font-medium ${
                          song.votes > 0 ? "text-green-400" : song.votes < 0 ? "text-red-400" : "text-muted-foreground"
                        }`}
                      >
                        {song.votes}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote(song.id, "down")}
                        className={`w-8 h-8 p-0 ${song.hasVoted === "down" ? "text-destructive" : "text-muted-foreground"}`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
