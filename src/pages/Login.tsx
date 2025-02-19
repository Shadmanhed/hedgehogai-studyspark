import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@/components/Auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AuthError, Session, AuthChangeEvent, AuthApiError } from "@supabase/supabase-js";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    console.log("Checking auth state...");
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session) => {
      console.log("Auth state changed:", event, session);
      if (session && !window.location.hash.includes('type=recovery')) {
        console.log("User is authenticated, redirecting to home");
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const handleAuthError = (error: AuthError) => {
      console.error("Auth error:", error);
      
      if (error instanceof AuthApiError) {
        switch (error.status) {
          case 400:
            if (error.message.includes("User already registered")) {
              toast({
                title: "Account Already Exists",
                description: "An account with this email already exists. Please try signing in instead.",
                variant: "destructive",
              });
            } else if (error.message.includes("Password should be at least 6 characters")) {
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
            break;
          default:
            toast({
              title: "Authentication Error",
              description: error.message,
              variant: "destructive",
            });
        }
      } else {
        toast({
          title: "Authentication Error",
          description: error.message,
          variant: "destructive",
        });
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session, error?: AuthError) => {
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