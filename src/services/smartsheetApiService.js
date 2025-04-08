const axios = require('axios');
const dotenv = require('dotenv');
const https = require('https');

dotenv.config();

const SMARTSHEET_API_BASE_URL = 'https://api.test.smartsheet.com/2.0';
const SMARTSHEET_API_KEY = process.env.SMARTSHEET_STAGING_API_KEY;

// Create a custom HTTPS agent that ignores SSL certificate errors (for testing only)
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

class SmartsheetApiService {
  constructor() {
    if (!SMARTSHEET_API_KEY) {
      console.error("ERROR: SMARTSHEET_STAGING_API_KEY environment variable is not set.");
      console.error("Please set it to your Smartsheet Staging API key:");
      console.error("export SMARTSHEET_STAGING_API_KEY=your_api_key_here");
    }

    this.apiHeaders = {
      'Authorization': `Bearer ${SMARTSHEET_API_KEY}`
    };

    console.log("Smartsheet API Key:", SMARTSHEET_API_KEY ? "Set (length: " + SMARTSHEET_API_KEY.length + ")" : "Not set or using default");
  }

  /**
   * Get a list of all sheets
   */
  async getSheets() {
    try {
      console.log('Fetching sheets from Smartsheet API...');
      const response = await axios.get(`${SMARTSHEET_API_BASE_URL}/sheets`, {
        headers: this.apiHeaders,
        httpsAgent: httpsAgent
      });
      console.log(`Retrieved ${response.data.totalCount} sheets`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sheets:', error);
      throw error;
    }
  }

  /**
   * Get details of a specific sheet by ID
   */
  async getSheetById(sheetId) {
    try {
      console.log(`Fetching sheet with ID ${sheetId}...`);
      const response = await axios.get(`${SMARTSHEET_API_BASE_URL}/sheets/${sheetId}`, {
        headers: this.apiHeaders,
        httpsAgent: httpsAgent
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching sheet with ID ${sheetId}:`, error);
      throw error;
    }
  }
}

module.exports = { SmartsheetApiService };
