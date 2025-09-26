
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Play,
  Users,
  Music,
  Vote,
  Radio,
  Heart,
  Zap,
  TrendingUp,
  Mic,
} from "lucide-react";
import Image from "next/image";
import { AppBar } from "./components/Appbar";

export default function HomePage() {
  const features = [
    {
      icon: Vote,
      title: "Fan-Driven Playlists",
      description: "Fans vote in real-time to choose what plays next during live streams",
    },
    {
      icon: Radio,
      title: "Live Streaming",
      description: "High-quality audio streaming with zero latency for seamless interaction",
    },
    {
      icon: Heart,
      title: "Creator Support",
      description: "Direct monetization through tips, subscriptions, and exclusive content",
    },
    {
      icon: Zap,
      title: "Instant Requests",
      description: "Lightning-fast song requests and voting system for dynamic playlists",
    },
    {
      icon: Users,
      title: "Community Building",
      description: "Build loyal fanbases through interactive music experiences",
    },
    {
      icon: TrendingUp,
      title: "Analytics Dashboard",
      description: "Track engagement, popular songs, and audience insights",
    },
  ];

  const steps = [
    {
      number: "01",
      icon: Mic,
      title: "Creator Goes Live",
      description: "Start your stream and connect with your audience in real-time",
    },
    {
      number: "02",
      icon: Users,
      title: "Fans Join & Vote",
      description: "Viewers join your stream and vote for songs they want to hear",
    },
    {
      number: "03",
      icon: Music,
      title: "Music Plays Live",
      description: "Top voted songs automatically play during your stream",
    },
  ];

  const creators = [
    {
      name: "DJ Luna",
      genre: "Electronic",
      followers: "125K",
      image: "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?auto=format&fit=crop&w=400&q=80",
    },
    {
      name: "Marcus Beats",
      genre: "Hip-Hop",
      followers: "89K",
      image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=400&q=80",
    },
    {
      name: "Aria Waves",
      genre: "Indie Pop",
      followers: "156K",
      image: "https://images.unsplash.com/photo-1525186402429-1fdf0a5a63f8?auto=format&fit=crop&w=400&q=80",
    },
  ];

  return (
    <main className="min-h-screen bg-background">
   <AppBar/>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-balance">
                  Your Fans
                  <span className="block text-primary">Choose</span>
                  The Beat
                </h1>
                <p className="text-xl text-muted-foreground text-pretty max-w-lg">
                  Revolutionary streaming platform where creators perform live and fans control the soundtrack.
                  Real-time music democracy meets live entertainment.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8">
                  <Play className="w-5 h-5 mr-2 fill-current" />
                  Start Streaming
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent">
                  Join as Fan
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">10K+ Active Creators</span>
                </div>
                <div className="flex items-center gap-2">
                  <Music className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">1M+ Songs Available</span>
                </div>
              </div>
            </div>

            <div className="relative w-full h-96">
              <Image
                src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80"
                alt="StreamSync Interface"
                fill
                className="object-cover rounded-2xl"
                priority
              />
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
              Where Music Meets
              <span className="block text-primary">Community</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              Revolutionary features that transform how creators and fans experience music together
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 bg-card border-border hover:border-primary/50 transition-colors group">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground text-pretty">{feature.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
              Simple. Interactive.
              <span className="block text-primary">Revolutionary.</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              Get started in three easy steps and transform your streaming experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <Card key={index} className="p-8 bg-card border-border text-center relative overflow-hidden">
                <div className="absolute top-4 right-4 text-6xl font-bold text-primary/10">{step.number}</div>
                <div className="space-y-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-semibold">{step.title}</h3>
                    <p className="text-muted-foreground text-pretty">{step.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Creator Showcase */}
      <section id="creators" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
              Featured
              <span className="block text-primary">Creators</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              Discover amazing creators who are already building communities through interactive music
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {creators.map((creator, index) => (
              <Card
                key={index}
                className="overflow-hidden bg-card border-border group hover:border-primary/50 transition-all"
              >
                <div className="aspect-square overflow-hidden relative">
                  <Image
                    src={creator.image}
                    alt={creator.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{creator.name}</h3>
                    <p className="text-primary font-medium">{creator.genre}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{creator.followers} followers</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors bg-transparent"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Listen
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-6xl font-bold tracking-tight text-balance">
                Ready to Transform
                <span className="block text-primary">Your Stream?</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
                Join thousands of creators who are already building stronger communities through interactive music
                experiences
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8">
                <Play className="w-5 h-5 mr-2 fill-current" />
                Start Creating
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent">
                <Users className="w-5 h-5 mr-2" />
                Join Community
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              Free to start • No credit card required • Join 10K+ creators
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Play className="w-4 h-4 text-primary-foreground fill-current" />
                </div>
                <span className="text-xl font-bold tracking-tight">StreamSync</span>
              </div>
              <p className="text-muted-foreground text-pretty">
                Revolutionizing live streaming through interactive music experiences.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    For Creators
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    For Fans
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Features
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Community
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    API Docs
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 StreamSync. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
