import { supabase } from "@/integrations/supabase/client";

export class InterpretationService {
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