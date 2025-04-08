const OpenAI = require('openai');
const dotenv = require('dotenv');
const https = require('https');

dotenv.config();

class OpenAIService {
  constructor() {
    // Create a custom HTTPS agent that ignores SSL certificate errors (for testing only)
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false
    });

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      httpAgent: httpsAgent
    });

    console.log("OpenAI API Key:", process.env.OPENAI_API_KEY ? "Set (length: " + process.env.OPENAI_API_KEY.length + ")" : "Not set");
  }

  /**
   * Make a custom OpenAI API call
   */
  async makeCustomApiCall(options) {
    return this.openai.chat.completions.create(options);
  }

  /**
   * Generate a description for a dog breed
   */
  async generateDogDescription(breed, characteristics) {
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
  async generateDogCareTips(breed, age, lifestyle) {
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

module.exports = { OpenAIService };
