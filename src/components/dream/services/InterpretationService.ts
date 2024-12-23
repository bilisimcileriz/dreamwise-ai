import { supabase } from "@/integrations/supabase/client";

export class InterpretationService {
  static async interpretDream(dreamText: string) {
    const startTime = Date.now();
    try {
      console.log("Starting dream interpretation process...");
      console.log("Dream text to interpret:", dreamText);
      
      const { data, error } = await supabase.functions.invoke('interpret-dream', {
        body: { dreamText },
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (error) {
        console.error("Error from interpret-dream function:", error);
        console.error("Error details:", error.message);
        throw new Error(`Failed to interpret dream: ${error.message}`);
      }

      console.log("Raw response from interpretation service:", data);

      if (!data?.interpretation) {
        console.error("Invalid response format:", data);
        throw new Error("No interpretation received from the service");
      }

      console.log("Successfully received interpretation");
      console.log("Time taken:", Date.now() - startTime, "ms");
      return data.interpretation;
    } catch (error) {
      console.error("Critical error in interpretDream:", error);
      console.error("Stack trace:", error.stack);
      throw error;
    }
  }
}