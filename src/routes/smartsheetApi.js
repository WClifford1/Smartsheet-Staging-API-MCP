const express = require('express');
const { SmartsheetApiService } = require('../services/smartsheetApiService');

const router = express.Router();
const smartsheetApiService = new SmartsheetApiService();

// Get all sheets
router.get('/sheets', async (req, res) => {
  try {
    const sheets = await smartsheetApiService.getSheets();
    res.json(sheets);
  } catch (error) {
    console.error('Error fetching sheets:', error);
    res.status(500).json({ error: 'Failed to fetch sheets' });
  }
});

// Get sheet by ID
router.get('/sheets/:sheetId', async (req, res) => {
  try {
    const sheetId = req.params.sheetId;
    const sheet = await smartsheetApiService.getSheetById(sheetId);
    res.json(sheet);
  } catch (error) {
    console.error('Error fetching sheet:', error);
    res.status(500).json({ error: 'Failed to fetch sheet' });
  }
});

module.exports = { smartsheetApiRouter: router };
