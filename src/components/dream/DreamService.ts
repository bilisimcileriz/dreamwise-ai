import { CreditsService } from "./services/CreditsService";
import { DreamStorageService } from "./services/DreamStorageService";
import { InterpretationService } from "./services/InterpretationService";

export class DreamService {
  static async fetchCredits(userId: string) {
    console.log("DreamService: Fetching credits for user:", userId);
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
    console.log("DreamService: Deducting credit for user:", userId);
    return CreditsService.deductCredit(userId, currentCredits);
  }

  static async createOrUpdateDream(userId: string, dreamText: string, status: 'pending' | 'success' | 'failed', dreamInterpretation?: string) {
    return DreamStorageService.createOrUpdateDream(userId, dreamText, status, dreamInterpretation);
  }

  static async interpretDream(dreamText: string) {
    return InterpretationService.interpretDream(dreamText);
  }
}