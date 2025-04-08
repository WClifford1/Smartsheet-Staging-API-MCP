# Smartsheet MCP Server

An MCP (Machine Conversation Protocol) server that integrates the Smartsheet API with OpenAI to provide enhanced Smartsheet information and services.

## Features

- Integration with the Smartsheet API for sheet information
- Integration with OpenAI for generating sheet summaries
- MCP protocol implementation for standardized tool and resource access
- RESTful API endpoints for accessing all functionality

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- OpenAI API key
- Smartsheet Staging API key

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd smartsheet-mcp
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following content:
   ```
   # OpenAI API Key
   OPENAI_API_KEY=your_openai_api_key_here

   # Smartsheet Staging API Key
   SMARTSHEET_STAGING_API_KEY=your_smartsheet_staging_api_key_here

   # Server Port
   PORT=3000
   ```

4. Replace `your_openai_api_key_here` with your actual OpenAI API key and `your_smartsheet_staging_api_key_here` with your actual Smartsheet Staging API key.

## Usage

### Development Mode

To run the server in development mode with hot reloading:

```
npm run dev
```

### Production Mode

To build and run the server in production mode:

```
npm run build
npm start
```

## API Endpoints

### Root Endpoint

- `GET /`: Welcome message and available endpoints

### Smartsheet API Endpoints

- `GET /api/smartsheet/sheets`: Get a list of all sheets
- `GET /api/smartsheet/sheets/:sheetId`: Get details of a specific sheet

### OpenAI Endpoints

- `POST /api/openai/generate-description`: Generate a description using OpenAI

### MCP Endpoints

- `GET /mcp/resources`: Get available MCP resources
- `GET /mcp/tools`: Get available MCP tools
- `POST /mcp/execute`: Execute an MCP tool
  - Request body: `{ "toolName": "list_sheets", "parameters": {} }`

## MCP Tools

### list_sheets

Lists all available Smartsheet sheets.

Parameters: None

### get_sheet_details

Gets details of a specific sheet by ID.

Parameters:
- `sheetId` (string, required): The ID of the sheet

### summarize_sheet

Generates a summary of a sheet using OpenAI.

Parameters:
- `sheetId` (string, required): The ID of the sheet to summarize

## Chat Interface

A simple chat interface is provided to interact with the MCP server using natural language. To use it:

1. Make sure the MCP server is running
2. Run the chat script with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here node chat-with-smartsheet-mcp.js
   ```
3. Ask questions about your Smartsheet data, such as:
   - "List all my sheets"
   - "Show me details of sheet with ID 123456789"
   - "Summarize sheet 123456789"

## License

ISC
