import { Button } from "./ui/button";
import { Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export const Navbar = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
    setIsMobileMenuOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const NavLinks = () => (
    <>
      <Button 
        variant="ghost" 
        className="text-muted-foreground hover:text-accent transition-colors"
        onClick={() => handleNavigation("/how-it-works")}
      >
        How it Works
      </Button>
      
      {isAuthenticated && (
        <>
          <Button 
            variant="ghost" 
            className="text-muted-foreground hover:text-accent transition-colors"
            onClick={() => handleNavigation("/summarizer")}
          >
            Summarizer
          </Button>
          <Button 
            variant="ghost" 
            className="text-muted-foreground hover:text-accent transition-colors"
            onClick={() => handleNavigation("/flashcards")}
          >
            Flashcards
          </Button>
          <Button 
            variant="ghost" 
            className="text-muted-foreground hover:text-accent transition-colors"
            onClick={() => handleNavigation("/ai-teacher")}
          >
            AI Teacher
          </Button>
          <Button 
            variant="ghost" 
            className="text-muted-foreground hover:text-accent transition-colors"
            onClick={() => handleNavigation("/pomodoro")}
          >
            Pomodoro Timer
          </Button>
        </>
      )}

      {isAuthenticated ? (
        <Button 
          variant="ghost" 
          className="text-accent hover:text-accent/90"
          onClick={handleLogout}
        >
          Sign Out
        </Button>
      ) : (
        <>
          <Button 
            variant="ghost" 
            className="text-accent hover:text-accent/90"
            onClick={() => handleNavigation("/login")}
          >
            Sign In
          </Button>
          <Button 
            className="bg-accent hover:bg-accent/90 text-white"
            onClick={() => handleNavigation("/login")}
          >
            Get Started
          </Button>
        </>
      )}
    </>
  );

  return (
    <nav className="border-b bg-white/80 backdrop-blur-md fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center cursor-pointer" onClick={() => handleNavigation("/")}>
            <Brain className="w-8 h-8 text-accent mr-2" />
            <span className="text-xl font-heading font-bold gradient-text">
              HedgehogAI
            </span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <NavLinks />
          </div>
          
          {/* Mobile Navigation */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" className="md:hidden p-2">
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
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-4 mt-8">
                <NavLinks />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};