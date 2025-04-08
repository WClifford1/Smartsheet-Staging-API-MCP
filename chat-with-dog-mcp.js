// chat-with-dog-mcp.js
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
  console.error('OPENAI_API_KEY=your_api_key_here node chat-with-dog-mcp.js');
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
    name: "get_dog_description",
    description: "Generate a description for a dog breed",
    parameters: {
      type: "object",
      properties: {
        breed: {
          type: "string",
          description: "The name of the dog breed"
        }
      },
      required: ["breed"]
    }
  },
  {
    name: "get_dog_care_tips",
    description: "Generate care tips for a dog breed",
    parameters: {
      type: "object",
      properties: {
        breed: {
          type: "string",
          description: "The name of the dog breed"
        },
        age: {
          type: "string",
          description: "The age of the dog"
        },
        lifestyle: {
          type: "string",
          description: "The lifestyle of the owner"
        }
      },
      required: ["breed"]
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

  console.log("Chat with the Dog MCP (type 'exit' to quit)");

  const messages = [
    { role: "system", content: "You are a helpful assistant that can provide information about dogs using the available tools." }
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
