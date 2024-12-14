import { supabase } from "@/integrations/supabase/client";

export class DreamService {
  static async fetchCredits(userId: string) {
    console.log("Fetching credits for user:", userId);
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
    console.log("Deducting credit. Current credits:", currentCredits);
    
    const newCreditAmount = Math.max(0, currentCredits - 1);
    const { data, error } = await supabase
      .from('profiles')
      .update({ credits: newCreditAmount })
      .eq('id', userId)
      .select('credits')
      .single();

    if (error) {
      console.error("Error deducting credit:", error);
      throw error;
    }

    console.log("Credits after deduction:", data.credits);
    return data.credits;
  }

  static async createOrUpdateDream(userId: string, dreamText: string, status: 'pending' | 'success' | 'failed', interpretation?: string) {
    console.log("Creating dream record with:", {
      userId,
      dreamText,
      status,
      interpretation
    });

    const { error } = await supabase
      .from('dreams')
      .insert({
        user_id: userId,
        dream_text: dreamText,
        status: status,
        interpretation: interpretation || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error("Error saving dream:", error);
      throw error;
    }

    console.log("Successfully saved dream with interpretation:", interpretation);
  }

  static async interpretDream(dreamText: string) {
    const { data, error } = await supabase.functions.invoke('interpret-dream', {
      body: { dreamText }
    });

    if (error) {
      console.error("Error interpreting dream:", error);
      throw error;
    }

    if (!data?.interpretation) {
      throw new Error("No interpretation received from AI");
    }

    console.log("Received interpretation:", data.interpretation);
    return data.interpretation;
  }
}