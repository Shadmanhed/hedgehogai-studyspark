import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { supabase } from "@/integrations/supabase/client";
import { ThemeSupa } from "@supabase/auth-ui-shared";

export const Auth = () => {
  // Get the current URL's origin (e.g., http://localhost:5173 or https://your-domain.com)
  const redirectTo = `${window.location.origin}/`;

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
      />
    </div>
  );
};