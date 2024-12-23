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
    try {
      setIsLoadingCredits(true);
      const fetchedCredits = await DreamService.fetchCredits(userId);
      console.log("Fetched credits:", fetchedCredits);
      
      if (typeof fetchedCredits !== 'number') {
        throw new Error("Invalid credits value received");
      }
      
      setCredits(fetchedCredits);
    } catch (error) {
      console.error("Error fetching credits:", error);
      toast({
        title: "Error",
        description: "Failed to fetch credits. Please try again.",
        variant: "destructive",
      });
      setCredits(null);
    } finally {
      setIsLoadingCredits(false);
    }
  };

  useEffect(() => {
    if (userId) {
      console.log("Fetching credits for user:", userId);
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
      // Create initial dream record with pending status
      await DreamService.createOrUpdateDream(userId, dream, 'pending');
      console.log("Created pending dream record");

      // Get interpretation from AI
      const interpretation = await DreamService.interpretDream(dream);
      console.log("Received dream interpretation");
      
      // Update dream record with success status and interpretation
      await DreamService.createOrUpdateDream(userId, dream, 'success', interpretation);
      console.log("Updated dream record with interpretation");
      
      // Deduct credit after successful interpretation
      const newCredits = await DreamService.deductCredit(userId, credits);
      console.log("Credits after deduction:", newCredits);
      setCredits(newCredits);
      
      // Update UI with interpretation
      setInterpretation(interpretation);
      
      toast({
        title: "Success",
        description: "Your dream has been interpreted",
      });
    } catch (error) {
      console.error("Error interpreting dream:", error);
      await DreamService.createOrUpdateDream(userId, dream, 'failed');
      toast({
        title: "Error",
        description: "Failed to interpret your dream. Please try again.",
        variant: "destructive",
      });
      // Refresh credits in case of error to ensure accurate display
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