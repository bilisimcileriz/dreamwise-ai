import { supabase } from "@/integrations/supabase/client";
import { LogService } from "../LogService";

export class CreditsService {
  static async fetchCredits(userId: string) {
    try {
      const startTime = Date.now();
      console.log("CreditsService: Starting credit fetch for user:", userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single();

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
      });

      if (error) {
        console.error("CreditsService: Error fetching credits:", error);
        throw new Error(`Failed to fetch credits: ${error.message}`);
      }

      if (data === null) {
        console.error("CreditsService: No profile found for user:", userId);
        throw new Error("User profile not found");
      }

      console.log("CreditsService: Successfully fetched credits:", data.credits);
      return data.credits;
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
      });

      console.log("CreditsService: Credit deduction successful. New credits:", data?.credits);
      return data?.credits ?? (currentCredits - 1);
    } catch (error) {
      console.error("CreditsService: Caught error in deductCredit:", error);
      throw error;
    }
  }
}