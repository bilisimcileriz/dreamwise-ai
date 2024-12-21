import { supabase } from "@/integrations/supabase/client";
import { LogService } from "../LogService";

export class CreditsService {
  static async fetchCredits(userId: string): Promise<number> {
    try {
      console.log("CreditsService: Starting credit fetch for user:", userId);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error("CreditsService: Database error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log("CreditsService: Profile data received:", profile);

      // If no profile exists, return default credits
      if (!profile) {
        console.log("CreditsService: No profile found, creating new profile with default credits");
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({ id: userId, credits: 5 })
          .select('credits')
          .single();

        if (insertError) {
          console.error("CreditsService: Error creating profile:", insertError);
          throw new Error(`Failed to create profile: ${insertError.message}`);
        }

        console.log("CreditsService: New profile created with credits:", newProfile?.credits);
        return newProfile?.credits ?? 5;
      }

      const credits = profile.credits ?? 5;
      console.log("CreditsService: Returning credits:", credits);
      return credits;

    } catch (error) {
      console.error("CreditsService: Unexpected error:", error);
      throw error;
    }
  }

  static async deductCredit(userId: string, currentCredits: number): Promise<number> {
    try {
      console.log("CreditsService: Starting credit deduction for user:", userId, "current credits:", currentCredits);
      
      if (currentCredits <= 0) {
        console.error("CreditsService: Insufficient credits");
        throw new Error("Insufficient credits");
      }

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