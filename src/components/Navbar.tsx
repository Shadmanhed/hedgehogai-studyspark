import { Button } from "./ui/button";
import { Brain } from "lucide-react";

export const Navbar = () => {
  return (
    <nav className="border-b bg-white/80 backdrop-blur-md fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Brain className="w-8 h-8 text-accent mr-2" />
            <span className="text-xl font-heading font-bold gradient-text">
              HedgehogAI
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-muted-foreground hover:text-accent transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-accent transition-colors">
              How it Works
            </a>
            <Button variant="ghost" className="text-accent hover:text-accent/90">
              Sign In
            </Button>
            <Button className="bg-accent hover:bg-accent/90 text-white">
              Get Started
            </Button>
          </div>
          
          <Button variant="ghost" className="md:hidden">
            <span className="sr-only">Open menu</span>
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </Button>
        </div>
      </div>
    </nav>
  );
};