import { CreditsService } from "./services/CreditsService";
import { DreamStorageService } from "./services/DreamStorageService";
import { InterpretationService } from "./services/InterpretationService";

export class DreamService {
  static async fetchCredits(userId: string) {
    return CreditsService.fetchCredits(userId);
  }

  static async deductCredit(userId: string, currentCredits: number) {
    return CreditsService.deductCredit(userId, currentCredits);
  }

  static async createOrUpdateDream(userId: string, dreamText: string, status: 'pending' | 'success' | 'failed', dreamInterpretation?: string) {
    return DreamStorageService.createOrUpdateDream(userId, dreamText, status, dreamInterpretation);
  }

  static async interpretDream(dreamText: string) {
    return InterpretationService.interpretDream(dreamText);
  }
}