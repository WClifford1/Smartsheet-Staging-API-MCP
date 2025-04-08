import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

export class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  /**
   * Make a custom OpenAI API call
   */
  async makeCustomApiCall(options: any): Promise<any> {
    return this.openai.chat.completions.create(options);
  }

  /**
   * Generate a description for a dog breed
   */
  async generateDogDescription(breed: string, characteristics?: string[]): Promise<string> {
    try {
      const characteristicsText = characteristics ?
        `with the following characteristics: ${characteristics.join(', ')}` : '';

      const prompt = `Generate a detailed and engaging description of a ${breed} dog ${characteristicsText}.
      Include information about their temperament, physical characteristics, and what makes them unique.`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a helpful assistant that provides detailed information about dog breeds." },
          { role: "user", content: prompt }
        ],
        max_tokens: 500
      });

      return response.choices[0].message.content || 'Unable to generate description';
    } catch (error) {
      console.error('Error generating dog description:', error);
      throw error;
    }
  }

  /**
   * Generate care tips for a dog breed
   */
  async generateDogCareTips(breed: string, age?: string, lifestyle?: string): Promise<string> {
    try {
      const ageText = age ? `The dog is ${age} old.` : '';
      const lifestyleText = lifestyle ? `The owner's lifestyle is ${lifestyle}.` : '';

      const prompt = `Generate care tips for a ${breed} dog. ${ageText} ${lifestyleText}
      Include information about exercise needs, grooming requirements, dietary considerations, and health concerns.`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a helpful assistant that provides detailed care tips for dog breeds." },
          { role: "user", content: prompt }
        ],
        max_tokens: 500
      });

      return response.choices[0].message.content || 'Unable to generate care tips';
    } catch (error) {
      console.error('Error generating dog care tips:', error);
      throw error;
    }
  }
}
