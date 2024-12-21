import { supabase } from "@/integrations/supabase/client";
import { LogService } from "../LogService";

export class CreditsService {
  static async fetchCredits(userId: string): Promise<number> {
    try {
      console.log("CreditsService: Starting credit fetch for user:", userId);
      
      // Validate session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      console.log("CreditsService: Session check:", { session: sessionData?.session, error: sessionError });
      
      if (sessionError) {
        console.error("CreditsService: Session error:", sessionError);
        throw new Error("Authentication error");
      }

      if (!sessionData.session) {
        console.error("CreditsService: No active session");
        throw new Error("No active session");
      }

      // Fetch credits
      const { data, error } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .maybeSingle();

      console.log("CreditsService: Credits fetch response:", { data, error });

      if (error) {
        console.error("CreditsService: Database error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      // If no profile exists, create one with default credits
      if (!data) {
        console.log("CreditsService: No profile found, creating new profile");
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{ id: userId, credits: 5 }])
          .select('credits')
          .single();

        if (createError) {
          console.error("CreditsService: Profile creation error:", createError);
          throw new Error(`Failed to create profile: ${createError.message}`);
        }

        const credits = newProfile?.credits ?? 5;
        console.log("CreditsService: New profile created with credits:", credits);
        return credits;
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
      console.log("CreditsService: Current credits:", currentCredits);

      const { data, error } = await supabase
        .from('profiles')
        .update({ credits: currentCredits - 1 })
        .eq('id', userId)
        .select('credits')
        .single();

      if (error) {
        console.error("CreditsService: Deduction error:", error);
        throw new Error(`Failed to deduct credit: ${error.message}`);
      }

      const newCredits = data?.credits ?? (currentCredits - 1);
      console.log("CreditsService: New credits after deduction:", newCredits);
      
      await LogService.createLog(userId, 'CREDIT_DEDUCTION', {
        previous_credits: currentCredits,
        new_credits: newCredits,
        action: 'dream_interpretation'
      }).catch(logError => {
        console.error("CreditsService: Log creation error:", logError);
      });

      return newCredits;

    } catch (error) {
      console.error("CreditsService: Deduction failed:", error);
      throw error;
    }
  }
}