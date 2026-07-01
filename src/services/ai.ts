/**
 * AI Service Layer
 *
 * Architecture for future AI integration.
 * Currently all methods are stubs.
 *
 * Future features:
 * - AI profile description generator
 * - Review sentiment analysis
 * - Fact-passport generator
 * - Moderation auto-detection
 */

export interface AIProvider {
  analyzeSentiment(text: string): Promise<{ score: number; label: string }>;
  generateProfileDescription(keywords: string[]): Promise<string>;
  moderateContent(text: string): Promise<{ isAppropriate: boolean; reason?: string }>;
}

class OpenAIAnalyzer implements AIProvider {
  async analyzeSentiment(_text: string): Promise<{ score: number; label: string }> {
    // TODO: Implement OpenAI sentiment analysis
    throw new Error("AI not implemented yet");
  }

  async generateProfileDescription(_keywords: string[]): Promise<string> {
    // TODO: Implement AI profile description generation
    throw new Error("AI not implemented yet");
  }

  async moderateContent(_text: string): Promise<{ isAppropriate: boolean; reason?: string }> {
    // TODO: Implement AI content moderation
    throw new Error("AI not implemented yet");
  }
}

export const ai: AIProvider = new OpenAIAnalyzer();