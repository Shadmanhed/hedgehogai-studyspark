import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { supabase } from "@/integrations/supabase/client";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

export const Auth = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [view, setView] = useState<'sign_in' | 'update_password'>('sign_in');
  
  // Get the current URL's origin
  const redirectTo = `${window.location.origin}/login`;

  useEffect(() => {
    // Check URL parameters for password reset token
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      console.log("Password reset flow detected");
      setView('update_password');
      toast({
        title: "Password Reset",
        description: "Please enter your new password below",
      });
    }
  }, [toast]);

  // Handle auth state change
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth event:", event);
      if (event === 'PASSWORD_RECOVERY') {
        setView('update_password');
      } else if (event === 'SIGNED_IN' && !window.location.hash.includes('type=recovery')) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <SupabaseAuth
        supabaseClient={supabase}
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: '#8E6C88',
                brandAccent: '#A17C6B',
              },
            },
          },
        }}
        theme="light"
        providers={[]}
        redirectTo={redirectTo}
        onlyThirdPartyProviders={false}
        view={view}
      />
    </div>
  );
};