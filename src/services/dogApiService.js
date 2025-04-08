const axios = require('axios');
const dotenv = require('dotenv');
const https = require('https');

dotenv.config();

const DOG_API_BASE_URL = 'https://api.thedogapi.com/v1';
const DOG_API_KEY = process.env.DOG_API_KEY;

// Create a custom HTTPS agent that ignores SSL certificate errors (for testing only)
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

class DogApiService {
  constructor() {
    this.apiHeaders = {
      'x-api-key': DOG_API_KEY
    };

    console.log("Dog API Key:", DOG_API_KEY ? "Set (length: " + DOG_API_KEY.length + ")" : "Not set or using default");
  }

  /**
   * Get a random dog image
   */
  async getRandomDog() {
    try {
      const response = await axios.get(`${DOG_API_BASE_URL}/images/search`, {
        headers: this.apiHeaders,
        httpsAgent: httpsAgent
      });
      return response.data[0];
    } catch (error) {
      console.error('Error fetching random dog:', error);
      throw error;
    }
  }

  /**
   * Get a list of all dog breeds
   */
  async getBreeds() {
    try {
      const response = await axios.get(`${DOG_API_BASE_URL}/breeds`, {
        headers: this.apiHeaders,
        httpsAgent: httpsAgent
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching dog breeds:', error);
      throw error;
    }
  }

  /**
   * Get images for a specific breed
   */
  async getImagesByBreed(breedId) {
    try {
      const response = await axios.get(`${DOG_API_BASE_URL}/images/search`, {
        params: {
          breed_id: breedId,
          limit: 10
        },
        headers: this.apiHeaders,
        httpsAgent: httpsAgent
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching breed images:', error);
      throw error;
    }
  }
}

module.exports = { DogApiService };
