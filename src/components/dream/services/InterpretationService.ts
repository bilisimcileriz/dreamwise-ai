import { supabase } from "@/integrations/supabase/client";

export class InterpretationService {
  static async interpretDream(dreamText: string) {
    const startTime = Date.now();
    try {
      console.log("Calling interpret-dream function with text:", dreamText);
      
      const { data, error } = await supabase.functions.invoke('interpret-dream', {
        body: { dreamText },
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (error) {
        console.error("Error from interpret-dream function:", error);
        throw new Error(`Failed to interpret dream: ${error.message}`);
      }

      if (!data?.interpretation) {
        console.error("Invalid response from interpret-dream function:", data);
        throw new Error("No interpretation received from the service");
      }

      console.log("Received interpretation:", data.interpretation);
      return data.interpretation;
    } catch (error) {
      console.error("Error in interpretDream:", error);
      throw error;
    }
  }
}