import { supabase } from "@/integrations/supabase/client";
import { LogService } from "./LogService";

export class DreamService {
  static async fetchCredits(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("Error fetching credits:", error);
      throw error;
    }

    console.log("Current credits:", data.credits);
    return data.credits;
  }

  static async deductCredit(userId: string, currentCredits: number) {
    const { error } = await supabase
      .from('profiles')
      .update({ credits: currentCredits - 1 })
      .eq('id', userId);

    if (error) {
      console.error("Error deducting credit:", error);
      throw error;
    }

    await LogService.createLog(userId, 'CREDIT_DEDUCTION', {
      previous_credits: currentCredits,
      new_credits: currentCredits - 1,
      action: 'dream_interpretation'
    });

    console.log("Credit deducted. Remaining credits:", currentCredits - 1);
    return currentCredits - 1;
  }

  static async createOrUpdateDream(userId: string, dreamText: string, status: 'pending' | 'success' | 'failed', dreamInterpretation?: string) {
    console.log(`Creating/Updating dream with status: ${status}`);
    
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
      if (existingDreams && existingDreams.length > 0) {
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
      } else {
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
      }

      if (result) {
        // Log the dream creation/update
        await LogService.createLog(userId, 'DREAM_OPERATION', {
          action: existingDreams?.length ? 'update' : 'create',
          dream_id: result.id,
          status,
          has_interpretation: !!dreamInterpretation
        });
      }

    } catch (error) {
      console.error("Error in createOrUpdateDream:", error);
      throw error;
    }
  }

  static async interpretDream(dreamText: string) {
    const { data, error } = await supabase.functions.invoke('interpret-dream', {
      body: { dreamText }
    });

    if (error) {
      console.error("Error interpreting dream:", error);
      throw error;
    }

    console.log("Received interpretation:", data.interpretation);
    return data.interpretation;
  }
}