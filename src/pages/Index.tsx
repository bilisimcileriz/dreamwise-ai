import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Moon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Card } from "@/components/ui/card";

const Index = () => {
  const [session, setSession] = useState(null);
  const [dream, setDream] = useState("");
  const [interpretation, setInterpretation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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

  const handleDreamSubmit = async () => {
    if (!dream.trim()) {
      toast({
        title: "Error",
        description: "Please describe your dream",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log("Submitting dream for user:", session?.user.id);
      
      // First, save the dream to the database
      const { error: dbError } = await supabase.from("dreams").insert({
        dream_text: dream,
        user_id: session.user.id,
      });

      if (dbError) {
        console.error("Database error:", dbError);
        throw dbError;
      }

      // Get the interpretation from our Edge Function
      const { data: interpretationData, error: interpretationError } = await supabase.functions
        .invoke('interpret-dream', {
          body: { dreamText: dream },
        });

      if (interpretationError) {
        console.error("Interpretation error:", interpretationError);
        throw interpretationError;
      }

      console.log("Received interpretation:", interpretationData);

      // Update the dream record with the interpretation
      const { error: updateError } = await supabase
        .from('dreams')
        .update({ interpretation: interpretationData.interpretation })
        .eq('user_id', session.user.id)
        .eq('dream_text', dream);

      if (updateError) {
        console.error("Update error:", updateError);
        throw updateError;
      }

      setInterpretation(interpretationData.interpretation);
      toast({
        title: "Success",
        description: "Your dream has been interpreted",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to interpret your dream. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
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
            onClick={() => supabase.auth.signOut()}
            className="bg-white/10 text-white hover:bg-white/20 border-purple-500/20"
          >
            Sign Out
          </Button>
        </div>

        <Card className="p-6 bg-white/10 backdrop-blur-lg border-purple-500/20">
          <div className="space-y-4">
            <Textarea
              placeholder="Describe your dream here..."
              value={dream}
              onChange={(e) => setDream(e.target.value)}
              className="min-h-[200px] bg-white/5 border-purple-500/30 text-white placeholder:text-purple-300"
            />
            <Button
              onClick={handleDreamSubmit}
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Interpreting...
                </>
              ) : (
                "Interpret Dream"
              )}
            </Button>
          </div>

          {interpretation && (
            <div className="mt-6 p-4 bg-white/5 rounded-lg border border-purple-500/30">
              <h3 className="text-lg font-semibold text-purple-200 mb-2">
                Dream Interpretation
              </h3>
              <p className="text-white whitespace-pre-wrap">{interpretation}</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Index;