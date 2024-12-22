import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { DreamService } from "@/components/dream/DreamService";

export const useCredits = (userId: string) => {
  const [credits, setCredits] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchCredits = async () => {
    try {
      console.log("useCredits: Starting credit fetch for user:", userId);
      setIsLoading(true);
      const fetchedCredits = await DreamService.fetchCredits(userId);
      console.log("useCredits: Credits fetched successfully:", fetchedCredits);
      setCredits(fetchedCredits);
    } catch (error) {
      console.error("useCredits: Credit fetch error:", error);
      toast({
        title: "Error",
        description: "Failed to load credits. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deductCredit = async () => {
    try {
      console.log("useCredits: Starting credit deduction");
      const newCredits = await DreamService.deductCredit(userId, credits);
      console.log("useCredits: Credits updated successfully:", newCredits);
      setCredits(newCredits);
      return true;
    } catch (error) {
      console.error("useCredits: Credit deduction error:", error);
      toast({
        title: "Error",
        description: "Failed to deduct credit. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    console.log("useCredits: useEffect triggered with userId:", userId);
    if (userId) {
      fetchCredits();
    }
  }, [userId]);

  return {
    credits,
    isLoading,
    deductCredit,
    fetchCredits,
  };
};