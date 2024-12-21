import { supabase } from "@/integrations/supabase/client";
import { LogService } from "../LogService";

export class CreditsService {
  static async fetchCredits(userId: string) {
    try {
      const startTime = Date.now();
      console.log("CreditsService: Starting credit fetch for user:", userId);
      
      // First check if user is authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log("CreditsService: Session check result:", { session, error: sessionError });
      
      if (!session) {
        console.error("CreditsService: No active session found");
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .maybeSingle();

      const endTime = Date.now();
      console.log("CreditsService: Raw response:", { data, error });

      // Log the API request details
      await LogService.createLog(userId, 'API_REQUEST', {
        operation: 'FETCH_CREDITS',
        request: {
          endpoint: 'profiles',
          method: 'SELECT',
          params: { userId }
        },
        response: {
          success: !error,
          data: data,
          error: error,
          duration_ms: endTime - startTime
        }
      }).catch(logError => {
        console.error("CreditsService: Failed to create log:", logError);
      });

      if (error) {
        console.error("CreditsService: Error fetching credits:", error);
        throw new Error(`Failed to fetch credits: ${error.message}`);
      }

      if (!data) {
        console.log("CreditsService: No profile found, creating one for user:", userId);
        // If no profile exists, create one with default credits
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{ id: userId, credits: 5 }])
          .select('credits')
          .single();

        if (createError) {
          console.error("CreditsService: Error creating profile:", createError);
          throw new Error(`Failed to create profile: ${createError.message}`);
        }

        console.log("CreditsService: Successfully created profile with credits:", newProfile?.credits);
        return newProfile?.credits ?? 5;
      }

      console.log("CreditsService: Successfully fetched credits:", data.credits);
      return data.credits ?? 5; // Fallback to 5 if credits is null
    } catch (error) {
      console.error("CreditsService: Caught error in fetchCredits:", error);
      throw error;
    }
  }

  static async deductCredit(userId: string, currentCredits: number) {
    try {
      if (currentCredits <= 0) {
        throw new Error("Insufficient credits");
      }

      const startTime = Date.now();
      console.log("CreditsService: Starting credit deduction for user:", userId);
      console.log("CreditsService: Current credits before deduction:", currentCredits);

      const { data, error } = await supabase
        .from('profiles')
        .update({ credits: currentCredits - 1 })
        .eq('id', userId)
        .select('credits')
        .single();

      const endTime = Date.now();
      console.log("CreditsService: Deduction response:", { data, error });

      if (error) {
        console.error("CreditsService: Error deducting credit:", error);
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
      }).catch(logError => {
        console.error("CreditsService: Failed to create deduction log:", logError);
      });

      console.log("CreditsService: Credit deduction successful. New credits:", data?.credits);
      return data?.credits ?? (currentCredits - 1);
    } catch (error) {
      console.error("CreditsService: Caught error in deductCredit:", error);
      throw error;
    }
  }
}