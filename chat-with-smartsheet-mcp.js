// chat-with-smartsheet-mcp.js
const { OpenAI } = require('openai');
const axios = require('axios');
const https = require('https');

// Create a custom HTTPS agent that ignores SSL certificate errors (for testing only)
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

// Check if OpenAI API key is set
if (!process.env.OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY environment variable is not set.');
  console.error('Please run the script with the API key:');
  console.error('OPENAI_API_KEY=your_api_key_here node chat-with-smartsheet-mcp.js');
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  httpAgent: httpsAgent
});

console.log('OpenAI API Key is set. Connecting to MCP server...');

// Configure axios to ignore SSL certificate errors
axios.defaults.httpsAgent = httpsAgent;

// Define functions that match your MCP tools
const functions = [
  {
    name: "list_sheets",
    description: "Get a list of all available Smartsheet sheets",
    parameters: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "get_sheet_details",
    description: "Get details of a specific Smartsheet sheet by ID",
    parameters: {
      type: "object",
      properties: {
        sheetId: {
          type: "string",
          description: "The ID of the sheet"
        }
      },
      required: ["sheetId"]
    }
  },
  {
    name: "summarize_sheet",
    description: "Generate a summary of a Smartsheet sheet using OpenAI",
    parameters: {
      type: "object",
      properties: {
        sheetId: {
          type: "string",
          description: "The ID of the sheet to summarize"
        }
      },
      required: ["sheetId"]
    }
  },
  {
    name: "analyze_project",
    description: "Analyze project status and provide insights for a project sheet",
    parameters: {
      type: "object",
      properties: {
        sheetId: {
          type: "string",
          description: "The ID of the project sheet to analyze"
        },
        analysisType: {
          type: "string",
          description: "Type of analysis to perform (status, risks, resources, timeline, or all)",
          enum: ["status", "risks", "resources", "timeline", "all"]
        }
      },
      required: ["sheetId"]
    }
  }
];

async function callMCP(toolName, parameters) {
  try {
    console.log(`Calling MCP tool: ${toolName} with parameters:`, parameters);

    const response = await axios.post('http://localhost:3000/mcp/execute', {
      toolName,
      parameters
    });

    console.log('MCP response received:', response.data);

    if (!response.data.success) {
      console.error('MCP returned an error:', response.data.error);
      return {
        success: false,
        error: response.data.error || 'Unknown error from MCP server'
      };
    }

    return response.data;
  } catch (error) {
    console.error('Error calling MCP:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    return {
      success: false,
      error: error.message || 'Failed to connect to MCP server'
    };
  }
}

async function chat() {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log("Chat with the Smartsheet MCP (type 'exit' to quit)");

  const messages = [
    { role: "system", content: "You are a helpful assistant that can provide information about Smartsheet data using the available tools. You can list sheets, get sheet details, generate summaries of sheets, and analyze project sheets to provide insights on status, risks, resources, and timelines. For project analysis, you should ask for the sheet ID and what type of analysis the user wants (status, risks, resources, timeline, or a comprehensive analysis)." }
  ];

  const askQuestion = () => {
    readline.question('You: ', async (userInput) => {
      if (userInput.toLowerCase() === 'exit') {
        readline.close();
        return;
      }

      messages.push({ role: "user", content: userInput });

      try {
        // Get response from OpenAI with function calling
        const response = await openai.chat.completions.create({
          model: "gpt-4",
          messages: messages,
          functions: functions,
          function_call: "auto"
        });

        const responseMessage = response.choices[0].message;

        // Check if the model wants to call a function
        if (responseMessage.function_call) {
          const functionName = responseMessage.function_call.name;
          const functionArgs = JSON.parse(responseMessage.function_call.arguments);

          console.log(`Assistant is using tool: ${functionName}`);

          // Call the MCP server with the function name and arguments
          const result = await callMCP(functionName, functionArgs);

          // Add the function response to the messages
          messages.push(responseMessage);
          messages.push({
            role: "function",
            name: functionName,
            content: JSON.stringify(result)
          });

          // Get a new response from the model
          const secondResponse = await openai.chat.completions.create({
            model: "gpt-4",
            messages: messages
          });

          const secondResponseMessage = secondResponse.choices[0].message;
          messages.push(secondResponseMessage);

          console.log(`Assistant: ${secondResponseMessage.content}`);
        } else {
          messages.push(responseMessage);
          console.log(`Assistant: ${responseMessage.content}`);
        }
      } catch (error) {
        console.error('Error:', error.message);
      }

      askQuestion();
    });
  };

  askQuestion();
}

chat();
