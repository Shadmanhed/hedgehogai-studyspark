import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { supabase } from "@/integrations/supabase/client";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export const Auth = () => {
  const { toast } = useToast();
  const redirectTo = `${window.location.origin}/reset-password`;

  useEffect(() => {
    // Check if there's a hash in the URL (indicates password reset)
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      console.log("Password reset flow detected");
      toast({
        title: "Password Reset",
        description: "Please enter your new password below",
        duration: 10000, // Keep the toast visible longer
      });

      // Remove any existing auth listeners to prevent automatic login
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          console.log('Password recovery event detected');
          // Instead of returning boolean, we just prevent default behavior
          return;
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [toast]);

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
        view={window.location.hash.includes('type=recovery') ? 'update_password' : 'sign_in'}
      />
    </div>
  );
};