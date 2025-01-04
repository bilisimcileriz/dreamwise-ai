import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Coins } from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface DreamFormProps {
  userId: string;
}

export const DreamForm = ({ userId }: DreamFormProps) => {
  const [dream, setDream] = useState("");
  const [interpretation, setInterpretation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCredits();
  }, [userId]);

  const fetchCredits = async () => {

   // setCredits(5);
   //  return 5;
    const { data, error } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("Error fetching credits:", error);
      toast({
        title: "Error",
        description: "Failed to fetch credits. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setCredits(data.credits);
    console.log("Current credits:", data.credits);
  };

  const deductCredit = async () => {
    const { error } = await supabase
      .from('profiles')
      .update({ credits: (credits || 0) - 1 })
      .eq('id', userId);

    if (error) {
      console.error("Error deducting credit:", error);
      toast({
        title: "Error",
        description: "Failed to deduct credit. Please try again.",
        variant: "destructive",
      });
      throw error;
    }

    setCredits((prev) => (prev !== null ? prev - 1 : null));
    console.log("Credit deducted. Remaining credits:", credits ? credits - 1 : 0);
  };

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
      
      await fetchCredits();
    }
  };

  const createOrUpdateDream = async (dreamText: string, status: 'pending' | 'success' | 'failed', dreamInterpretation?: string) => {
    console.log(`Creating/Updating dream with status: ${status}`);
    
    try {
      // First try to find an existing pending dream
      const { data: existingDreams, error: searchError } = await supabase
        .from('dreams')
        .select('id')
        .eq('user_id', userId)
        .eq('dream_text', dreamText)
        .eq('status', 'pending');

      if (searchError) {
        console.error("Error searching for existing dream:", searchError);
        throw searchError;
      }

      if (existingDreams && existingDreams.length > 0) {
        // Update existing dream
        const { error } = await supabase
          .from('dreams')
          .update({
            status: status,
            interpretation: dreamInterpretation
          })
          .eq('id', existingDreams[0].id);

        if (error) {
          console.error("Error updating dream:", error);
          throw error;
        }
      } else {
        // Create new dream record
        const { error } = await supabase
          .from('dreams')
          .insert({
            user_id: userId,
            dream_text: dreamText,
            status: status,
            interpretation: dreamInterpretation
          });

        if (error) {
          console.error("Error creating dream:", error);
          throw error;
        }
      }
    } catch (error) {
      console.error("Error in createOrUpdateDream:", error);
      throw error;
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

    if (!credits || credits < 1) {
      toast({
        title: "Insufficient Credits",
        description: "You need at least 1 credit to interpret a dream",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log("Submitting dream for user:", userId);
      
      await ensureProfile(userId);
      
      // Create initial dream record
      await createOrUpdateDream(dream, 'pending');

      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('interpret-dream', {
        body: { dreamText: dream }
      });

      if (error) {
        await createOrUpdateDream(dream, 'failed');
        throw error;
      }

      // Deduct credit after successful interpretation
      await deductCredit();

      const interpretation = data.interpretation;
      console.log("Received interpretation:", interpretation);
      setInterpretation(interpretation);
      
      // Update dream record with success status and interpretation
      await createOrUpdateDream(dream, 'success', interpretation);

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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Interpret Your Dream</h2>
        <div className="flex items-center gap-2 text-purple-200">
          <Coins className="h-5 w-5" />
          <span>{credits ?? 0} credits remaining</span>
        </div>
      </div>

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
          disabled={isLoading || !credits || credits < 1}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Interpreting...
            </>
          ) : (
            <>
              Interpret Dream (1 credit)
            </>
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
