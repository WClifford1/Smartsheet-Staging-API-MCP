const express = require('express');
const { DogApiService } = require('../services/dogApiService');

const router = express.Router();
const dogApiService = new DogApiService();

// Get random dog image
router.get('/random', async (req, res) => {
  try {
    const randomDog = await dogApiService.getRandomDog();
    res.json(randomDog);
  } catch (error) {
    console.error('Error fetching random dog:', error);
    res.status(500).json({ error: 'Failed to fetch random dog' });
  }
});

// Get dog breeds
router.get('/breeds', async (req, res) => {
  try {
    const breeds = await dogApiService.getBreeds();
    res.json(breeds);
  } catch (error) {
    console.error('Error fetching dog breeds:', error);
    res.status(500).json({ error: 'Failed to fetch dog breeds' });
  }
});

// Get dog images by breed
router.get('/breeds/:breedId/images', async (req, res) => {
  try {
    const breedId = parseInt(req.params.breedId);
    const images = await dogApiService.getImagesByBreed(breedId);
    res.json(images);
  } catch (error) {
    console.error('Error fetching breed images:', error);
    res.status(500).json({ error: 'Failed to fetch breed images' });
  }
});

module.exports = { dogApiRouter: router };
