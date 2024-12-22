import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@/components/Auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    console.log("Checking auth state...");
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session);
      if (session) {
        console.log("User is authenticated, redirecting to home");
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const handleAuthError = (error: Error) => {
      console.error("Auth error:", error);
      if (error.message.includes("Password should be at least 6 characters")) {
        toast({
          title: "Password Error",
          description: "Password must be at least 6 characters long",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Authentication Error",
          description: error.message,
          variant: "destructive",
        });
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session, error) => {
      if (error) {
        handleAuthError(error);
      }
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  return (
    <div className="min-h-screen bg-primary/20 flex flex-col items-center justify-center px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-heading font-bold text-accent mb-2">Welcome to HedgehogAI</h1>
        <p className="text-muted-foreground">Sign in to access your study tools</p>
      </div>
      <Auth />
    </div>
  );
};

export default Login;