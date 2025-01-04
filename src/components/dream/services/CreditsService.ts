import { supabase } from "@/integrations/supabase/client";
import { LogService } from "../LogService";

export class CreditsService {
  static async fetchCredits(userId: string): Promise<number> {
    try {
      const startTime = Date.now();
      console.log("Starting credits fetch for user:", userId);
      return 5;
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .maybeSingle();

      console.log("Profile query result:", { profile, profileError });
      
      if (profileError) {
        console.error("Error fetching profile:", profileError);
        throw profileError;
      }

      // If no profile exists, create one with default credits
      if (!profile) {
        console.log("Profile not found, creating new profile with default credits");
        
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([{ id: userId, credits: 5 }])
          .select('credits')
          .maybeSingle();

        if (insertError) {
          console.error("Error creating profile:", insertError);
          throw insertError;
        }

        const endTime = Date.now();
        console.log("New profile created with credits:", newProfile?.credits);
        
        await LogService.createLog(userId, 'PROFILE_CREATION', {
          credits: newProfile?.credits,
          duration_ms: endTime - startTime
        });

        return newProfile?.credits ?? 5;
      }

      const endTime = Date.now();
      console.log("Successfully fetched credits:", profile.credits);
      console.log("Fetch operation completed in", endTime - startTime, "ms");

      await LogService.createLog(userId, 'CREDITS_FETCH', {
        credits: profile.credits,
        duration_ms: endTime - startTime
      });

      const finalCredits = profile.credits ?? 5;
      console.log("Returning credits value:", finalCredits);
      return finalCredits;
    } catch (error) {
      console.error("Critical error in fetchCredits:", error);
      throw error;
    }
  }

  static async deductCredit(userId: string, currentCredits: number): Promise<number> {
    try {
      if (currentCredits <= 0) {
        throw new Error("Insufficient credits");
      }

      const startTime = Date.now();
      console.log("Starting credit deduction for user:", userId);
      console.log("Current credits before deduction:", currentCredits);

      const { data, error } = await supabase
        .from('profiles')
        .update({ credits: currentCredits - 1 })
        .eq('id', userId)
        .select('credits')
        .maybeSingle();

      if (error) {
        console.error("Error deducting credit:", error);
        throw error;
      }

      const endTime = Date.now();
      console.log("Credit deduction completed in", endTime - startTime, "ms");
      console.log("Credit deduction response:", { data, error });

      await LogService.createLog(userId, 'CREDIT_DEDUCTION', {
        previous_credits: currentCredits,
        new_credits: data?.credits ?? 0,
        duration_ms: endTime - startTime
      });

      console.log("Credit deducted successfully. New credits:", data?.credits);
      return data?.credits ?? currentCredits - 1;
    } catch (error) {
      console.error("Critical error in deductCredit:", error);
      throw error;
    }
  }
}