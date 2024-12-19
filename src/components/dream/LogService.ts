import { supabase } from "@/integrations/supabase/client";

export class LogService {
  static async createLog(userId: string, operationType: string, details: any) {
    console.log(`Creating log for operation: ${operationType}`, details);
    
    try {
      const { error } = await supabase
        .from('operation_logs')
        .insert({
          user_id: userId,
          operation_type: operationType,
          details
        });

      if (error) {
        console.error("Error creating log:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error in createLog:", error);
      throw error;
    }
  }
}