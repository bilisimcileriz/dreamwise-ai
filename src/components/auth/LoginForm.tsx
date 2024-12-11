import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Card } from "@/components/ui/card";
import { Moon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const LoginForm = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-indigo-900 p-4">
      <div className="max-w-md mx-auto pt-16">
        <div className="text-center mb-8">
          <Moon className="h-16 w-16 text-purple-300 mx-auto" />
          <h1 className="text-4xl font-bold text-white mt-4">Dream Interpreter</h1>
          <p className="text-purple-200 mt-2">
            Sign in to interpret your dreams
          </p>
        </div>
        <Card className="p-6 bg-white/10 backdrop-blur-lg border-purple-500/20">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#9333ea',
                    brandAccent: '#7e22ce',
                  },
                },
              },
            }}
            providers={[]}
          />
        </Card>
      </div>
    </div>
  );
};