import { supabase } from "@/integrations/supabase/client";
import { LogService } from "./LogService";

export class DreamService {
  static async fetchCredits(userId: string) {
    try {
      const startTime = Date.now();
      const { data, error } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .maybeSingle();

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
        throw error;
      }

      console.log("Current credits:", data?.credits);
      return data?.credits;
    } catch (error) {
      console.error("Error in fetchCredits:", error);
      throw error;
    }
  }

  static async deductCredit(userId: string, currentCredits: number) {
    try {
      const startTime = Date.now();
      const { error } = await supabase
        .from('profiles')
        .update({ credits: currentCredits - 1 })
        .eq('id', userId);

      const endTime = Date.now();

      if (error) {
        console.error("Error deducting credit:", error);
        throw error;
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

      console.log("Credit deducted. Remaining credits:", currentCredits - 1);
      return currentCredits - 1;
    } catch (error) {
      console.error("Error in deductCredit:", error);
      throw error;
    }
  }

  static async createOrUpdateDream(userId: string, dreamText: string, status: 'pending' | 'success' | 'failed', dreamInterpretation?: string) {
    console.log(`Creating/Updating dream with status: ${status}`);
    const startTime = Date.now();
    
    try {
      // First try to find an existing pending dream
      const { data: existingDreams, error: searchError } = await supabase
        .from('dreams')
        .select('id')
        .eq('user_id', userId)
        .eq('dream_text', dreamText)
        .eq('status', 'pending');

      if (searchError) {
        console.error("Error searching for existing dream:", searchError);
        throw searchError;
      }

      const dreamData = {
        status,
        interpretation: dreamInterpretation,
        ...((!existingDreams || existingDreams.length === 0) && {
          user_id: userId,
          dream_text: dreamText,
        })
      };

      let result;
      let operationType;
      let apiResponse;

      if (existingDreams && existingDreams.length > 0) {
        operationType = 'UPDATE_DREAM';
        const { data, error } = await supabase
          .from('dreams')
          .update(dreamData)
          .eq('id', existingDreams[0].id)
          .select()
          .maybeSingle();

        if (error) {
          console.error("Error updating dream:", error);
          throw error;
        }
        result = data;
        apiResponse = { success: true, operation: 'update', error: null };
      } else {
        operationType = 'CREATE_DREAM';
        const { data, error } = await supabase
          .from('dreams')
          .insert(dreamData)
          .select()
          .maybeSingle();

        if (error) {
          console.error("Error creating dream:", error);
          throw error;
        }
        result = data;
        apiResponse = { success: true, operation: 'insert', error: null };
      }

      const endTime = Date.now();

      if (result) {
        // Log detailed dream operation
        await LogService.createLog(userId, 'DREAM_OPERATION', {
          action: existingDreams?.length ? 'update' : 'create',
          dream_id: result.id,
          status,
          has_interpretation: !!dreamInterpretation,
          api_details: {
            operation: operationType,
            request: {
              endpoint: 'dreams',
              method: existingDreams?.length ? 'UPDATE' : 'INSERT',
              params: dreamData
            },
            response: apiResponse,
            performance: {
              duration_ms: endTime - startTime
            }
          },
          dream_details: {
            text_length: dreamText.length,
            interpretation_length: dreamInterpretation?.length || 0
          }
        });
      }

    } catch (error) {
      console.error("Error in createOrUpdateDream:", error);
      const endTime = Date.now();
      
      // Log error details
      await LogService.createLog(userId, 'ERROR', {
        operation: 'DREAM_OPERATION',
        error: {
          message: error.message,
          code: error.code,
          details: error.details
        },
        timing: {
          started_at: new Date(startTime).toISOString(),
          ended_at: new Date(endTime).toISOString(),
          duration_ms: endTime - startTime
        }
      });
      
      throw error;
    }
  }

  static async interpretDream(dreamText: string) {
    const startTime = Date.now();
    try {
      const { data, error } = await supabase.functions.invoke('interpret-dream', {
        body: { dreamText }
      });

      const endTime = Date.now();

      if (error) {
        console.error("Error interpreting dream:", error);
        throw error;
      }

      console.log("Received interpretation:", data.interpretation);
      return data.interpretation;
    } catch (error) {
      console.error("Error in interpretDream:", error);
      throw error;
    }
  }
}