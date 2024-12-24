import { supabase } from "@/integrations/supabase/client";
import { LogService } from "../LogService";

export class CreditsService {
  static async fetchCredits(userId: string) {
    try {
      const startTime = Date.now();
      console.log("Starting credits fetch for user:", userId);
      
      const { data, error, status } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .maybeSingle();

      const endTime = Date.now();
      console.log("Credits fetch completed in", endTime - startTime, "ms");
      console.log("Response status:", status);

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
          status: status,
          duration_ms: endTime - startTime
        }
      });

      if (error) {
        console.error("Error fetching credits:", error);
        throw new Error(`Failed to fetch credits: ${error.message}`);
      }

      if (data === null) {
        console.log("No profile found for user:", userId);
        return 0; // Return 0 credits if no profile exists
      }

      console.log("Successfully fetched credits:", data.credits);
      return data.credits ?? 0; // Return 0 if credits is null
    } catch (error) {
      console.error("Critical error in fetchCredits:", error);
      // Log the error but return a default value to prevent UI breaking
      return 0;
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