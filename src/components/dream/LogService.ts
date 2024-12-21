import { supabase } from "@/integrations/supabase/client";

export class LogService {
  static async createLog(userId: string, operationType: string, details: any) {
    console.log(`Creating detailed log for operation: ${operationType}`, details);
    
    try {
      // Add timestamp to all logs
      const enrichedDetails = {
        ...details,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      };

      const { error } = await supabase
        .from('operation_logs')
        .insert({
          user_id: userId,
          operation_type: operationType,
          details: enrichedDetails
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