import { supabase } from "@/integrations/supabase/client";
import { LogService } from "../LogService";

export class CreditsService {
  static async fetchCredits(userId: string) {
    try {
      const startTime = Date.now();
      console.log("Starting credits fetch for user:", userId);
      
      // First check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('credits').eq('id', userId)
        ;

      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, create one with default credits
        console.log("Profile not found, creating new profile with default credits");
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({ id: userId, credits: 5 })
          .select('credits')
          .single();

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

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        throw profileError;
      }

      const endTime = Date.now();
      console.log("Successfully fetched credits:", profile?.credits);

      await LogService.createLog(userId, 'CREDITS_FETCH', {
        credits: profile?.credits,
        duration_ms: endTime - startTime
      });

      return profile?.credits ?? 5;
    } catch (error) {
      console.error("Critical error in fetchCredits:", error);
      throw error;
    }
  }

  static async deductCredit(userId: string, currentCredits: number) {
    try {
      if (currentCredits <= 0) {
        throw new Error("Insufficient credits");
      }

      const startTime = Date.now();
      console.log("Starting credit deduction for user:", userId);

      const { data, error } = await supabase
        .from('profiles')
        .update({ credits: currentCredits - 1 })
        .eq('id', userId)
        .select('credits')
        .maybeSingle();

      const endTime = Date.now();
      console.log("Credit deduction completed in", endTime - startTime, "ms");

      if (error) {
        console.error("Error deducting credit:", error);
        throw new Error(`Failed to deduct credit: ${error.message}`);
      }

      // Log credit deduction with detailed API info
      await LogService.createLog(userId, 'CREDIT_DEDUCTION', {
        previous_credits: currentCredits,
        new_credits: currentCredits - 1,
        action: 'dream_interpretation',
        api_details: {
          operation: 'UPDATE_CREDITS',
          request: {
            endpoint: 'profiles',
            method: 'UPDATE',
            params: { userId, newCredits: currentCredits - 1 }
          },
          performance: {
            duration_ms: endTime - startTime
          }
        }
      });

      console.log("Credit deducted successfully. New credits:", data?.credits);
      return data?.credits ?? (currentCredits - 1);
    } catch (error) {
      console.error("Critical error in deductCredit:", error);
      throw error;
    }
  }
}
