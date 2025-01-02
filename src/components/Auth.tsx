import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { supabase } from "@/integrations/supabase/client";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

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
      });
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