import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Card } from "@/components/ui/card";
import { Moon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export const LoginForm = () => {
  const { toast } = useToast();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (event === "SIGNED_IN") {
        console.log("User signed in, updating profile with username");
        // Extract username from email
        const username = session?.user?.email?.split('@')[0];
        if (username && session?.user?.id) {
          //const { error } = await supabase
           // .from('profiles')
           // .update({ username: username })
           // .eq('id', session.user.id);

          if (error) {
            console.error("Error updating username:", error);
            toast({
              title: "Error",
              description: "Failed to update username",
              variant: "destructive",
            });
          } else {
            console.log("Username updated successfully:", username);
          }
        }
      } else if (event === "SIGNED_OUT") {
        console.log("User signed out");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  // Handle authentication errors
  const handleError = (error: Error) => {
    console.error("Auth error:", error);

    if (error.message.includes("rate limit")) {
      toast({
        title: "Please wait",
        description: "Please wait a minute before trying again",
        variant: "destructive",
      });
    } else if (error.message.includes("Invalid login credentials")) {
      toast({
        title: "Invalid credentials",
        description: "Please check your email and password",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Authentication error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Email',
                  password_label: 'Password',
                },
                sign_up: {
                  email_label: 'Email',
                  password_label: 'Password',
                },
              },
            }}
          />
        </Card>
      </div>
    </div>
  );
};
