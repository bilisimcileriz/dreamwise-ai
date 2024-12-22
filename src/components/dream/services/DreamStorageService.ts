import { supabase } from "@/integrations/supabase/client";
import { LogService } from "../LogService";

export class DreamStorageService {
  static async createOrUpdateDream(userId: string, dreamText: string, status: 'pending' | 'success' | 'failed', dreamInterpretation?: string) {
    console.log(`Creating/Updating dream with status: ${status}`);
    const startTime = Date.now();
    
    try {
      // First try to find an existing pending dream
      const { data: existingDreams, error: searchError } = await supabase
        .from('dreams')
        .select()
        .eq('user_id', userId)
        .eq('dream_text', dreamText)
        .eq('status', 'pending')
        .maybeSingle();

      if (searchError) {
        console.error("Error searching for existing dream:", searchError);
        throw searchError;
      }

      const dreamData = {
        status,
        interpretation: dreamInterpretation,
        ...((!existingDreams) && {
          user_id: userId,
          dream_text: dreamText,
        })
      };

      let result;
      let operationType;
      let apiResponse;

      if (existingDreams) {
        operationType = 'UPDATE_DREAM';
        const { data, error } = await supabase
          .from('dreams')
          .update(dreamData)
          .eq('id', existingDreams.id)
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
          action: existingDreams ? 'update' : 'create',
          dream_id: result.id,
          status,
          has_interpretation: !!dreamInterpretation,
          api_details: {
            operation: operationType,
            request: {
              endpoint: 'dreams',
              method: existingDreams ? 'UPDATE' : 'INSERT',
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
}