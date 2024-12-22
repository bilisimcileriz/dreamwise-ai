import { DreamStorageService } from "./services/DreamStorageService";
import { InterpretationService } from "./services/InterpretationService";

export class DreamService {
  static async createOrUpdateDream(userId: string, dreamText: string, status: 'pending' | 'success' | 'failed', dreamInterpretation?: string) {
    return DreamStorageService.createOrUpdateDream(userId, dreamText, status, dreamInterpretation);
  }

  static async interpretDream(dreamText: string) {
    return InterpretationService.interpretDream(dreamText);
  }
}