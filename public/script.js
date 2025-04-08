document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    // Function to add a message to the chat
    function addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);

        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        messageContent.innerHTML = content;

        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);

        // Scroll to the bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Function to show thinking indicator
    function showThinking() {
        const thinkingDiv = document.createElement('div');
        thinkingDiv.classList.add('message', 'assistant', 'thinking');
        thinkingDiv.id = 'thinking-indicator';

        const text = document.createElement('span');
        text.textContent = 'Thinking';

        const dots = document.createElement('div');
        dots.classList.add('dot-flashing');

        thinkingDiv.appendChild(text);
        thinkingDiv.appendChild(dots);
        chatMessages.appendChild(thinkingDiv);

        // Scroll to the bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Function to hide thinking indicator
    function hideThinking() {
        const thinkingDiv = document.getElementById('thinking-indicator');
        if (thinkingDiv) {
            thinkingDiv.remove();
        }
    }

    // Function to send a message to the server
    async function sendMessage(message) {
        try {
            showThinking();

            // First, get OpenAI to decide which tool to use
            const openaiResponse = await fetch('/api/openai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: 'You are a helpful assistant that can provide information about Smartsheet data using the available tools. You can list sheets, get sheet details, generate summaries of sheets, and analyze project sheets to provide insights on status, risks, resources, and timelines. For project analysis, you should ask for the sheet ID and what type of analysis the user wants (status, risks, resources, timeline, or a comprehensive analysis).' },
                        { role: 'user', content: message }
                    ],
                    functions: [
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
                    ],
                    function_call: "auto"
                })
            });

            if (!openaiResponse.ok) {
                throw new Error(`OpenAI API error: ${openaiResponse.status}`);
            }

            const openaiData = await openaiResponse.json();

            // Check if OpenAI wants to call a function
            if (openaiData.function_call) {
                const functionName = openaiData.function_call.name;
                const functionArgs = JSON.parse(openaiData.function_call.arguments);

                console.log(`Calling function: ${functionName} with args:`, functionArgs);

                // Call the MCP server with the function name and arguments
                const mcpResponse = await fetch('/mcp/execute', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        toolName: functionName,
                        parameters: functionArgs
                    })
                });

                if (!mcpResponse.ok) {
                    throw new Error(`MCP API error: ${mcpResponse.status}`);
                }

                const mcpData = await mcpResponse.json();

                // Get a final response from OpenAI with the function result
                const finalResponse = await fetch('/api/openai/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        messages: [
                            { role: 'system', content: 'You are a helpful assistant that can provide information about Smartsheet data using the available tools. You can list sheets, get sheet details, generate summaries of sheets, and analyze project sheets to provide insights on status, risks, resources, and timelines. For project analysis, you should ask for the sheet ID and what type of analysis the user wants (status, risks, resources, timeline, or a comprehensive analysis).' },
                            { role: 'user', content: message },
                            { role: 'assistant', content: '', function_call: openaiData.function_call },
                            { role: 'function', name: functionName, content: JSON.stringify(mcpData) }
                        ]
                    })
                });

                if (!finalResponse.ok) {
                    throw new Error(`OpenAI API error: ${finalResponse.status}`);
                }

                const finalData = await finalResponse.json();
                hideThinking();
                return finalData.content;
            } else {
                // OpenAI didn't call a function, just return the response
                hideThinking();
                return openaiData.content;
            }
        } catch (error) {
            console.error('Error:', error);
            hideThinking();
            return `Sorry, there was an error: ${error.message}`;
        }
    }

    // Handle send button click
    sendButton.addEventListener('click', async () => {
        const message = userInput.value.trim();
        if (message) {
            // Add user message to chat
            addMessage(message, 'user');

            // Clear input
            userInput.value = '';

            // Get response from server
            const response = await sendMessage(message);

            // Add assistant message to chat
            addMessage(response, 'assistant');
        }
    });

    // Handle enter key press
    userInput.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendButton.click();
        }
    });

    // Auto-resize textarea
    userInput.addEventListener('input', () => {
        userInput.style.height = 'auto';
        userInput.style.height = (userInput.scrollHeight) + 'px';
    });
});
