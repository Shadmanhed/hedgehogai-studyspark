import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@/components/Auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AuthError, Session, AuthChangeEvent } from "@supabase/supabase-js";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    console.log("Checking if this is a password reset flow...");
    if (!window.location.hash.includes('type=recovery')) {
      console.log("Not a password reset flow, redirecting to login");
      navigate("/login");
      return;
    }
  }, [navigate]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session, error?: AuthError) => {
      console.log("Auth state changed in reset password:", event, session);
      if (error) {
        console.error("Auth error:", error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
      
      // Only redirect after successful password update
      if (event === 'PASSWORD_RECOVERY' && session) {
        console.log("Password successfully reset");
        toast({
          title: "Success",
          description: "Password has been reset successfully. You can now log in.",
        });
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-primary/20 flex flex-col items-center justify-center px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-heading font-bold text-accent mb-2">Reset Your Password</h1>
        <p className="text-muted-foreground">Please enter your new password below</p>
      </div>
      <Auth />
    </div>
  );
};

export default ResetPassword;