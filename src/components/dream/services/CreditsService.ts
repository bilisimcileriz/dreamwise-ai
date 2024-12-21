import { supabase } from "@/integrations/supabase/client";
import { LogService } from "../LogService";

export class CreditsService {
  static async fetchCredits(userId: string) {
    try {
      const startTime = Date.now();
      console.log("Fetching credits for user:", userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single();

      const endTime = Date.now();

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
        console.error("Error fetching credits:", error);
        throw new Error(`Failed to fetch credits: ${error.message}`);
      }

      if (data === null) {
        console.error("No profile found for user:", userId);
        throw new Error("User profile not found");
      }

      console.log("Current credits:", data.credits);
      return data.credits;
    } catch (error) {
      console.error("Error in fetchCredits:", error);
      throw error;
    }
  }

  static async deductCredit(userId: string, currentCredits: number) {
    try {
      if (currentCredits <= 0) {
        throw new Error("Insufficient credits");
      }

      const startTime = Date.now();
      console.log("Deducting credit for user:", userId, "Current credits:", currentCredits);

      const { data, error } = await supabase
        .from('profiles')
        .update({ credits: currentCredits - 1 })
        .eq('id', userId)
        .select('credits')
        .single();

      const endTime = Date.now();

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

      console.log("Credit deducted. New credits:", data?.credits);
      return data?.credits ?? (currentCredits - 1);
    } catch (error) {
      console.error("Error in deductCredit:", error);
      throw error;
    }
  }
}