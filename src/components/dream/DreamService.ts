import { supabase } from "@/integrations/supabase/client";

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

    console.log("Credit deducted. Remaining credits:", currentCredits - 1);
    return currentCredits - 1;
  }

  static async createOrUpdateDream(userId: string, dreamText: string, status: 'pending' | 'success' | 'failed', dreamInterpretation?: string) {
    console.log(`Creating/Updating dream with status: ${status}, interpretation: ${dreamInterpretation}`);
    
    const dreamData = {
      user_id: userId,
      dream_text: dreamText,
      status,
      interpretation: dreamInterpretation,
      updated_at: new Date().toISOString()
    };

    console.log("Saving dream data:", dreamData);

    try {
      const { error } = await supabase
        .from('dreams')
        .insert(dreamData);

      if (error) {
        console.error("Error saving dream:", error);
        throw error;
      }

      console.log("Successfully saved dream with interpretation");
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