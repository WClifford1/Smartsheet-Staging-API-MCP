import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const DOG_API_BASE_URL = 'https://api.thedogapi.com/v1';
const DOG_API_KEY = process.env.DOG_API_KEY;

export interface DogBreed {
  id: number;
  name: string;
  temperament?: string;
  life_span?: string;
  weight?: { imperial: string; metric: string };
  height?: { imperial: string; metric: string };
  bred_for?: string;
  breed_group?: string;
  origin?: string;
  reference_image_id?: string;
}

export interface DogImage {
  id: string;
  url: string;
  width: number;
  height: number;
  breeds?: DogBreed[];
}

export class DogApiService {
  private apiHeaders = {
    'x-api-key': DOG_API_KEY
  };

  /**
   * Get a random dog image
   */
  async getRandomDog(): Promise<DogImage> {
    try {
      const response = await axios.get(`${DOG_API_BASE_URL}/images/search`, {
        headers: this.apiHeaders
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
  async getBreeds(): Promise<DogBreed[]> {
    try {
      const response = await axios.get(`${DOG_API_BASE_URL}/breeds`, {
        headers: this.apiHeaders
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
  async getImagesByBreed(breedId: number): Promise<DogImage[]> {
    try {
      const response = await axios.get(`${DOG_API_BASE_URL}/images/search`, {
        params: {
          breed_id: breedId,
          limit: 10
        },
        headers: this.apiHeaders
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching breed images:', error);
      throw error;
    }
  }
}
