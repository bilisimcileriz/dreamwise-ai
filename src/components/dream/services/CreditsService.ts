import { supabase } from "@/integrations/supabase/client";
import { LogService } from "../LogService";

export class CreditsService {
  static async fetchCredits(userId: string): Promise<number> {
    try {
      console.log("CreditsService: Starting credit fetch for user:", userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error("CreditsService: Database error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      // If no profile exists, return default credits
      if (!data) {
        console.log("CreditsService: No profile found, returning default credits");
        return 5;
      }

      const credits = data.credits ?? 5;
      console.log("CreditsService: Returning credits:", credits);
      return credits;

    } catch (error) {
      console.error("CreditsService: Unexpected error:", error);
      throw error;
    }
  }

  static async deductCredit(userId: string, currentCredits: number): Promise<number> {
    try {
      if (currentCredits <= 0) {
        console.error("CreditsService: Insufficient credits");
        throw new Error("Insufficient credits");
      }

      console.log("CreditsService: Deducting credit for user:", userId);
      
      const newCredits = currentCredits - 1;
      const { data, error } = await supabase
        .from('profiles')
        .update({ credits: newCredits })
        .eq('id', userId)
        .select('credits')
        .single();

      if (error) {
        console.error("CreditsService: Deduction error:", error);
        throw new Error(`Failed to deduct credit: ${error.message}`);
      }

      console.log("CreditsService: Credit deducted successfully, new balance:", newCredits);
      
      await LogService.createLog(userId, 'CREDIT_DEDUCTION', {
        previous_credits: currentCredits,
        new_credits: newCredits,
        action: 'dream_interpretation'
      });

      return newCredits;

    } catch (error) {
      console.error("CreditsService: Deduction failed:", error);
      throw error;
    }
  }
}