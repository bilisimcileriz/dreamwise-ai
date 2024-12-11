import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Moon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LoginForm } from "@/components/auth/LoginForm";
import { DreamForm } from "@/components/dream/DreamForm";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [session, setSession] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      console.log("Session loaded:", session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      console.log("Auth state changed:", session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      console.log("Attempting to sign out...");
      // First clear the local session state
      setSession(null);
      
      // Then attempt to sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error);
        // Even if there's an error, we keep the session cleared locally
        toast({
          title: "Warning",
          description: "You've been signed out locally, but there was a server error",
          variant: "destructive",
        });
      } else {
        console.log("Successfully signed out");
        toast({
          title: "Signed out",
          description: "You have been successfully signed out",
        });
      }
    } catch (error) {
      console.error("Unexpected error during sign out:", error);
      // Keep the session cleared even if there's an error
      toast({
        title: "Warning",
        description: "You've been signed out locally, but there was an error",
        variant: "destructive",
      });
    }
  };

  if (!session) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto space-y-8 pt-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Moon className="h-8 w-8 text-purple-300" />
            <h1 className="text-2xl font-bold text-white">Dream Interpreter</h1>
          </div>
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="bg-white/10 text-white hover:bg-white/20 border-purple-500/20"
          >
            Sign Out
          </Button>
        </div>

        <DreamForm userId={session.user.id} />
      </div>
    </div>
  );
};

export default Index;
