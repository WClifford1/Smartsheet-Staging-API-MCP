const express = require('express');
const { OpenAIService } = require('../services/openaiService');

const router = express.Router();
const openaiService = new OpenAIService();

// Chat with OpenAI
router.post('/chat', async (req, res) => {
  try {
    const { messages, functions, function_call } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Create options for the API call
    const options = {
      model: "gpt-4",
      messages: messages,
      max_tokens: 500
    };

    // Add functions if provided
    if (functions) {
      options.functions = functions;
    }

    // Add function_call if provided
    if (function_call) {
      options.function_call = function_call;
    }

    // Call OpenAI
    const response = await openaiService.makeCustomApiCall(options);

    // Return the response
    res.json(response.choices[0].message);
  } catch (error) {
    console.error('Error in OpenAI chat:', error);
    res.status(500).json({ error: 'Failed to process chat request' });
  }
});

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
