import { CreditsService } from "./services/CreditsService";
import { DreamStorageService } from "./services/DreamStorageService";
import { InterpretationService } from "./services/InterpretationService";

export class DreamService {
  static async fetchCredits(userId: string) {
    console.log("DreamService: Starting credit fetch for user:", userId);
    try {
      const credits = await CreditsService.fetchCredits(userId);
      console.log("DreamService: Credits fetched successfully:", credits);
      return credits;
    } catch (error) {
      console.error("DreamService: Error fetching credits:", error);
      throw error;
    }
  }

  static async deductCredit(userId: string, currentCredits: number) {
    console.log("DreamService: Starting credit deduction for user:", userId);
    try {
      const newCredits = await CreditsService.deductCredit(userId, currentCredits);
      console.log("DreamService: Credit deducted successfully, new balance:", newCredits);
      return newCredits;
    } catch (error) {
      console.error("DreamService: Error deducting credit:", error);
      throw error;
    }
  }

  static async createOrUpdateDream(userId: string, dreamText: string, status: 'pending' | 'success' | 'failed', dreamInterpretation?: string) {
    return DreamStorageService.createOrUpdateDream(userId, dreamText, status, dreamInterpretation);
  }

  static async interpretDream(dreamText: string) {
    return InterpretationService.interpretDream(dreamText);
  }
}