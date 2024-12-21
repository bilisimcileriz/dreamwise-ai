import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DreamInput } from "./DreamInput";
import { CreditsDisplay } from "./CreditsDisplay";
import { InterpretationDisplay } from "./InterpretationDisplay";
import { DreamService } from "./DreamService";

interface DreamFormProps {
  userId: string;
}

export const DreamForm = ({ userId }: DreamFormProps) => {
  const [dream, setDream] = useState("");
  const [interpretation, setInterpretation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [isLoadingCredits, setIsLoadingCredits] = useState(true);
  const { toast } = useToast();

  const fetchCredits = async () => {
    if (!userId) {
      console.error("DreamForm: No userId provided");
      setIsLoadingCredits(false);
      setCredits(0);
      return;
    }

    try {
      console.log("DreamForm: Fetching credits for user:", userId);
      const fetchedCredits = await DreamService.fetchCredits(userId);
      console.log("DreamForm: Credits fetched successfully:", fetchedCredits);
      setCredits(fetchedCredits);
    } catch (error) {
      console.error("DreamForm: Credit fetch error:", error);
      setCredits(0);
      toast({
        title: "Error",
        description: "Failed to load credits. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCredits(false);
    }
  };

  useEffect(() => {
    console.log("DreamForm: Initial mount with userId:", userId);
    if (userId) {
      fetchCredits();
    }
  }, [userId]);

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
      console.log("DreamForm: Starting dream interpretation");
      await DreamService.createOrUpdateDream(userId, dream, 'pending');
      
      const interpretation = await DreamService.interpretDream(dream);
      console.log("DreamForm: Dream interpreted successfully");
      
      await DreamService.createOrUpdateDream(userId, dream, 'success', interpretation);
      
      const newCredits = await DreamService.deductCredit(userId, credits);
      console.log("DreamForm: Credits updated:", newCredits);
      
      setCredits(newCredits);
      setInterpretation(interpretation);
      
      toast({
        title: "Success",
        description: "Your dream has been interpreted",
      });
    } catch (error) {
      console.error("DreamForm: Interpretation error:", error);
      await DreamService.createOrUpdateDream(userId, dream, 'failed');
      toast({
        title: "Error",
        description: "Failed to interpret your dream. Please try again.",
        variant: "destructive",
      });
      fetchCredits();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-white/10 backdrop-blur-lg border-purple-500/20">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Interpret Your Dream</h2>
        <CreditsDisplay credits={credits} isLoading={isLoadingCredits} />
      </div>

      <div className="space-y-4">
        <DreamInput dream={dream} onChange={setDream} />
        <Button
          onClick={handleDreamSubmit}
          className="w-full bg-purple-600 hover:bg-purple-700"
          disabled={isLoading || !credits || credits < 1 || isLoadingCredits}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Interpreting...
            </>
          ) : (
            "Interpret Dream (1 credit)"
          )}
        </Button>
      </div>

      <InterpretationDisplay interpretation={interpretation} />
    </Card>
  );
};