const express = require('express');
const { OpenAIService } = require('../services/openaiService');

const router = express.Router();
const openaiService = new OpenAIService();

// Generate dog description
router.post('/generate-description', async (req, res) => {
  try {
    const { breed, characteristics } = req.body;

    if (!breed) {
      return res.status(400).json({ error: 'Breed is required' });
    }

    const description = await openaiService.generateDogDescription(breed, characteristics);
    res.json({ description });
  } catch (error) {
    console.error('Error generating dog description:', error);
    res.status(500).json({ error: 'Failed to generate dog description' });
  }
});

// Generate dog care tips
router.post('/generate-care-tips', async (req, res) => {
  try {
    const { breed, age, lifestyle } = req.body;

    if (!breed) {
      return res.status(400).json({ error: 'Breed is required' });
    }

    const careTips = await openaiService.generateDogCareTips(breed, age, lifestyle);
    res.json({ careTips });
  } catch (error) {
    console.error('Error generating dog care tips:', error);
    res.status(500).json({ error: 'Failed to generate dog care tips' });
  }
});

module.exports = { openaiRouter: router };
