import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { DreamService } from "@/components/dream/DreamService";

export const useDreamSubmission = (userId: string) => {
  const [interpretation, setInterpretation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const submitDream = async (dream: string) => {
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
      console.log("useDreamSubmission: Starting dream interpretation");
      await DreamService.createOrUpdateDream(userId, dream, 'pending');
      
      const interpretation = await DreamService.interpretDream(dream);
      console.log("useDreamSubmission: Dream interpreted successfully");
      
      await DreamService.createOrUpdateDream(userId, dream, 'success', interpretation);
      
      setInterpretation(interpretation);
      
      toast({
        title: "Success",
        description: "Your dream has been interpreted",
      });
    } catch (error) {
      console.error("useDreamSubmission: Interpretation error:", error);
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

  return {
    interpretation,
    isLoading,
    submitDream,
  };
};