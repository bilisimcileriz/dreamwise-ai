import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface DreamFormProps {
  userId: string;
}

export const DreamForm = ({ userId }: DreamFormProps) => {
  const [dream, setDream] = useState("");
  const [interpretation, setInterpretation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const ensureProfile = async (userId: string) => {
    console.log("Checking profile for user:", userId);
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error("Error fetching profile:", fetchError);
    }

    if (!profile) {
      console.log("Creating profile for user:", userId);
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({ id: userId });

      if (insertError) {
        console.error("Error creating profile:", insertError);
        throw insertError;
      }
    }
  };

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
      console.log("Submitting dream for user:", userId);
      
      await ensureProfile(userId);

      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('interpret-dream', {
        body: { dreamText: dream }
      });

      if (error) {
        throw error;
      }

      console.log("Received interpretation:", data);
      setInterpretation(data.interpretation);
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

  return (
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
  );
};