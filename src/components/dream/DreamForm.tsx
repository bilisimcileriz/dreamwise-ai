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
  const { toast } = useToast();

  useEffect(() => {
    fetchCredits();
  }, [userId]);

  const fetchCredits = async () => {
    try {
      const userCredits = await DreamService.fetchCredits(userId);
      console.log("Fetched initial credits:", userCredits);
      setCredits(userCredits);
    } catch (error) {
      console.error("Error fetching credits:", error);
      toast({
        title: "Error",
        description: "Failed to fetch credits. Please try again.",
        variant: "destructive",
      });
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
      // First get the interpretation from AI
      const interpretationResult = await DreamService.interpretDream(dream);
      console.log("Received interpretation from AI:", interpretationResult);

      // Then save the dream with the interpretation
      await DreamService.createOrUpdateDream(
        userId,
        dream,
        'success',
        interpretationResult
      );
      console.log("Dream saved with interpretation");

      // Update the UI with the interpretation
      setInterpretation(interpretationResult);

      // Deduct credit and update UI with new credit count
      const newCredits = await DreamService.deductCredit(userId, credits);
      console.log("Updated credits after deduction:", newCredits);
      setCredits(newCredits);

      toast({
        title: "Success",
        description: "Your dream has been interpreted",
      });
    } catch (error) {
      console.error("Error in dream interpretation process:", error);
      await DreamService.createOrUpdateDream(userId, dream, 'failed');
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
        <CreditsDisplay credits={credits} />
      </div>

      <div className="space-y-4">
        <DreamInput dream={dream} onChange={setDream} />
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
            "Interpret Dream (1 credit)"
          )}
        </Button>
      </div>

      <InterpretationDisplay interpretation={interpretation} />
    </Card>
  );
};