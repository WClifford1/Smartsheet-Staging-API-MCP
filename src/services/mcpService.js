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
      },
      {
        name: 'analyze_project',
        description: 'Analyze project status and provide insights for a project sheet',
        parameters: [
          {
            name: 'sheetId',
            type: 'string',
            description: 'The ID of the project sheet to analyze',
            required: true
          },
          {
            name: 'analysisType',
            type: 'string',
            description: 'Type of analysis to perform (status, risks, resources, timeline, or all)',
            required: false
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
        case 'analyze_project':
          return await this.analyzeProject(parameters);
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

  /**
   * Analyze a project sheet and provide insights
   */
  async analyzeProject(parameters) {
    const { sheetId, analysisType = 'all' } = parameters;

    if (!sheetId) {
      return {
        success: false,
        error: 'Sheet ID is required'
      };
    }

    try {
      // Get the sheet details with rows and columns
      const sheet = await this.smartsheetApiService.getSheetById(sheetId);

      if (!sheet.rows || sheet.rows.length === 0) {
        return {
          success: false,
          error: 'The sheet does not contain any rows to analyze'
        };
      }

      // Extract column information to understand the sheet structure
      const columnMap = {};
      sheet.columns.forEach(column => {
        columnMap[column.title.toLowerCase().replace(/\s+/g, '_')] = column.id;
      });

      // Extract project data from the sheet
      const projectData = {
        name: sheet.name,
        tasks: sheet.rows.map(row => {
          const task = {};
          row.cells.forEach(cell => {
            const column = sheet.columns.find(col => col.id === cell.columnId);
            if (column) {
              task[column.title] = cell.value;
            }
          });
          return task;
        })
      };

      // Create a prompt based on the analysis type
      let prompt = `Analyze the following project data from Smartsheet:\n\n`;
      prompt += `Project Name: ${projectData.name}\n`;
      prompt += `Number of Tasks: ${projectData.tasks.length}\n\n`;

      // Add task data
      prompt += `Tasks:\n`;
      projectData.tasks.forEach((task, index) => {
        prompt += `${index + 1}. `;
        Object.entries(task).forEach(([key, value]) => {
          prompt += `${key}: ${value || 'N/A'}, `;
        });
        prompt += '\n';
      });

      // Add specific analysis instructions based on type
      switch (analysisType.toLowerCase()) {
        case 'status':
          prompt += '\nProvide a concise status report of this project. Briefly list which tasks are completed, in progress, delayed, or not started. Use bullet points for clarity. Keep your response under 200 words.';
          break;
        case 'risks':
          prompt += '\nIdentify the top 3-5 risks in this project. Focus on delayed tasks, dependencies that might be affected, and critical path issues. Be brief and actionable. Keep your response under 200 words.';
          break;
        case 'resources':
          prompt += '\nProvide a brief analysis of resource allocation. Identify who has the most tasks and who might be overallocated. Suggest 1-2 specific resource optimizations. Keep your response under 200 words.';
          break;
        case 'timeline':
          prompt += '\nGive a concise timeline analysis. Estimate completion date based on current progress and identify the 2-3 most critical timeline issues. Keep your response under 200 words.';
          break;
        default:
          prompt += '\nProvide a brief analysis of this project covering status, top risks, resource allocation, and timeline. Offer 2-3 specific, actionable recommendations. Use bullet points where appropriate. Keep your response under 300 words.';
      }

      // Use OpenAI to analyze the project data
      const response = await this.openaiService.makeCustomApiCall({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a project management expert that analyzes Smartsheet project data and provides valuable insights and recommendations. Be concise and to the point. Focus on the most important information and limit your response to 3-4 paragraphs maximum. Use bullet points where appropriate."
          },
          { role: "user", content: prompt }
        ],
        max_tokens: 300
      });

      const analysis = response.choices[0].message.content;

      return {
        success: true,
        data: {
          sheetId,
          projectName: sheet.name,
          analysisType,
          analysis,
          taskCount: projectData.tasks.length
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to analyze project'
      };
    }
  }
}

module.exports = { MCPService };
