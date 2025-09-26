"use client";

import { Button } from "@/components/ui/button";
import { Play, Menu } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";

export function AppBar() {
  const { data: session } = useSession();

  return (
    <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Play className="w-4 h-4 text-primary-foreground fill-current" />
          </div>
          <span className="text-xl font-bold tracking-tight">StreamSync</span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
            How It Works
          </a>
          <a href="#creators" className="text-sm font-medium hover:text-primary transition-colors">
            Creators
          </a>
        </nav>

        <div className="flex items-center gap-4">
          {session ? (
            <Button variant="ghost" size="sm" onClick={() => signOut()}>
              Sign Out
            </Button>
          ) : (
            <Button variant="ghost" size="sm" className="hidden md:flex" onClick={() => signIn()}>
              Sign In
            </Button>
          )}
          <Button size="sm" className="bg-primary hover:bg-primary/90">
            Get Started
          </Button>
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
