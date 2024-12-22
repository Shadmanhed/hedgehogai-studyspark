import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@/components/Auth";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

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