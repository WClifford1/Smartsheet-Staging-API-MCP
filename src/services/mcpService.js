const { DogApiService } = require('./dogApiService');
const { OpenAIService } = require('./openaiService');

class MCPService {
  constructor() {
    this.dogApiService = new DogApiService();
    this.openaiService = new OpenAIService();
  }

  /**
   * Get available MCP resources
   */
  getResources() {
    return [
      {
        name: 'dog_breeds',
        description: 'Information about dog breeds',
        endpoint: '/api/dogs/breeds'
      },
      {
        name: 'random_dog',
        description: 'Get a random dog image',
        endpoint: '/api/dogs/random'
      },
      {
        name: 'breed_images',
        description: 'Get images for a specific breed',
        endpoint: '/api/dogs/breeds/{breedId}/images'
      }
    ];
  }

  /**
   * Get available MCP tools
   */
  getTools() {
    return [
      {
        name: 'get_dog_description',
        description: 'Generate a description for a dog breed',
        parameters: [
          {
            name: 'breed',
            type: 'string',
            description: 'The name of the dog breed',
            required: true
          },
          {
            name: 'characteristics',
            type: 'array',
            description: 'Specific characteristics to include in the description',
            required: false
          }
        ]
      },
      {
        name: 'get_dog_care_tips',
        description: 'Generate care tips for a dog breed',
        parameters: [
          {
            name: 'breed',
            type: 'string',
            description: 'The name of the dog breed',
            required: true
          },
          {
            name: 'age',
            type: 'string',
            description: 'The age of the dog',
            required: false
          },
          {
            name: 'lifestyle',
            type: 'string',
            description: 'The lifestyle of the owner',
            required: false
          }
        ]
      },
      {
        name: 'get_breed_match',
        description: 'Find dog breeds that match given criteria',
        parameters: [
          {
            name: 'criteria',
            type: 'object',
            description: 'Criteria for matching dog breeds (size, temperament, etc.)',
            required: true
          }
        ]
      }
    ];
  }

  /**
   * Execute an MCP tool
   */
  async executeTool(toolName, parameters) {
    try {
      switch (toolName) {
        case 'get_dog_description':
          return await this.getDogDescription(parameters);
        case 'get_dog_care_tips':
          return await this.getDogCareTips(parameters);
        case 'get_breed_match':
          return await this.getBreedMatch(parameters);
        default:
          return {
            success: false,
            error: `Unknown tool: ${toolName}`
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'An error occurred while executing the tool'
      };
    }
  }

  /**
   * Get a description for a dog breed
   */
  async getDogDescription(parameters) {
    const { breed, characteristics } = parameters;

    if (!breed) {
      return {
        success: false,
        error: 'Breed is required'
      };
    }

    try {
      const description = await this.openaiService.generateDogDescription(breed, characteristics);
      return {
        success: true,
        data: { description }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to generate dog description'
      };
    }
  }

  /**
   * Get care tips for a dog breed
   */
  async getDogCareTips(parameters) {
    const { breed, age, lifestyle } = parameters;

    if (!breed) {
      return {
        success: false,
        error: 'Breed is required'
      };
    }

    try {
      const careTips = await this.openaiService.generateDogCareTips(breed, age, lifestyle);
      return {
        success: true,
        data: { careTips }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to generate dog care tips'
      };
    }
  }

  /**
   * Get dog breeds that match given criteria
   */
  async getBreedMatch(parameters) {
    const { criteria } = parameters;

    if (!criteria) {
      return {
        success: false,
        error: 'Criteria is required'
      };
    }

    try {
      // Get all breeds
      const breeds = await this.dogApiService.getBreeds();

      // Use OpenAI to find matches based on criteria
      const prompt = `Given the following dog breeds and their characteristics:
      ${JSON.stringify(breeds.map(b => ({
        name: b.name,
        temperament: b.temperament,
        bred_for: b.bred_for,
        breed_group: b.breed_group,
        life_span: b.life_span,
        weight: b.weight?.metric,
        height: b.height?.metric
      })))}

      Find the top 3 dog breeds that best match the following criteria:
      ${JSON.stringify(criteria)}

      Return the result as a JSON array with the breed name and a brief explanation of why it matches.`;

      const response = await this.openaiService.makeCustomApiCall({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a helpful assistant that matches dog breeds to criteria. Return only valid JSON." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      const matches = content ? JSON.parse(content) : { matches: [] };

      return {
        success: true,
        data: matches
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to find matching breeds'
      };
    }
  }
}

module.exports = { MCPService };
