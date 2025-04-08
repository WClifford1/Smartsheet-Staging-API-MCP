const { SmartsheetApiService } = require('./smartsheetApiService');
const { OpenAIService } = require('./openaiService');

class MCPService {
  constructor() {
    this.smartsheetApiService = new SmartsheetApiService();
    this.openaiService = new OpenAIService();
  }

  /**
   * Get available MCP resources
   */
  getResources() {
    return [
      {
        name: 'sheets',
        description: 'Information about Smartsheet sheets',
        endpoint: '/api/smartsheet/sheets'
      },
      {
        name: 'sheet_details',
        description: 'Get details for a specific sheet',
        endpoint: '/api/smartsheet/sheets/{sheetId}'
      }
    ];
  }

  /**
   * Get available MCP tools
   */
  getTools() {
    return [
      {
        name: 'list_sheets',
        description: 'Get a list of all available sheets',
        parameters: []
      },
      {
        name: 'get_sheet_details',
        description: 'Get details of a specific sheet by ID',
        parameters: [
          {
            name: 'sheetId',
            type: 'string',
            description: 'The ID of the sheet',
            required: true
          }
        ]
      },
      {
        name: 'summarize_sheet',
        description: 'Generate a summary of a sheet using OpenAI',
        parameters: [
          {
            name: 'sheetId',
            type: 'string',
            description: 'The ID of the sheet to summarize',
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
        case 'list_sheets':
          return await this.listSheets();
        case 'get_sheet_details':
          return await this.getSheetDetails(parameters);
        case 'summarize_sheet':
          return await this.summarizeSheet(parameters);
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
   * List all available sheets
   */
  async listSheets() {
    try {
      const sheets = await this.smartsheetApiService.getSheets();
      return {
        success: true,
        data: sheets
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to list sheets'
      };
    }
  }

  /**
   * Get details of a specific sheet
   */
  async getSheetDetails(parameters) {
    const { sheetId } = parameters;

    if (!sheetId) {
      return {
        success: false,
        error: 'Sheet ID is required'
      };
    }

    try {
      const sheet = await this.smartsheetApiService.getSheetById(sheetId);
      return {
        success: true,
        data: sheet
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to get sheet details'
      };
    }
  }

  /**
   * Generate a summary of a sheet using OpenAI
   */
  async summarizeSheet(parameters) {
    const { sheetId } = parameters;

    if (!sheetId) {
      return {
        success: false,
        error: 'Sheet ID is required'
      };
    }

    try {
      // Get the sheet details
      const sheet = await this.smartsheetApiService.getSheetById(sheetId);

      // Create a prompt for OpenAI
      const prompt = `Summarize the following Smartsheet data:

Sheet Name: ${sheet.name}
Number of Columns: ${sheet.columns ? sheet.columns.length : 'Unknown'}
Number of Rows: ${sheet.rows ? sheet.rows.length : 'Unknown'}

Please provide a concise summary of the sheet's purpose and content based on its structure.`;

      // Use OpenAI to generate a summary
      const response = await this.openaiService.makeCustomApiCall({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a helpful assistant that summarizes Smartsheet data." },
          { role: "user", content: prompt }
        ],
        max_tokens: 500
      });

      const summary = response.choices[0].message.content;

      return {
        success: true,
        data: {
          sheetId,
          sheetName: sheet.name,
          summary
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to summarize sheet'
      };
    }
  }
}

module.exports = { MCPService };
