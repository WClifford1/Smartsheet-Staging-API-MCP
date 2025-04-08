# Dog MCP Server

An MCP (Machine Conversation Protocol) server that integrates The Dog API with OpenAI to provide enhanced dog-related information and services.

## Features

- Integration with The Dog API for dog breed information and images
- Integration with OpenAI for generating dog descriptions and care tips
- MCP protocol implementation for standardized tool and resource access
- RESTful API endpoints for accessing all functionality

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- OpenAI API key
- The Dog API key

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd dog-mcp
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following content:
   ```
   # OpenAI API Key
   OPENAI_API_KEY=your_openai_api_key_here

   # The Dog API Key
   DOG_API_KEY=your_dog_api_key_here

   # Server Port
   PORT=3000
   ```

4. Replace `your_openai_api_key_here` with your actual OpenAI API key and `your_dog_api_key_here` with your actual Dog API key.

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

### Dog API Endpoints

- `GET /api/dogs/random`: Get a random dog image
- `GET /api/dogs/breeds`: Get a list of all dog breeds
- `GET /api/dogs/breeds/:breedId/images`: Get images for a specific breed

### OpenAI Endpoints

- `POST /api/openai/generate-description`: Generate a description for a dog breed
  - Request body: `{ "breed": "Labrador", "characteristics": ["friendly", "energetic"] }`

- `POST /api/openai/generate-care-tips`: Generate care tips for a dog breed
  - Request body: `{ "breed": "Labrador", "age": "puppy", "lifestyle": "active" }`

### MCP Endpoints

- `GET /mcp/resources`: Get available MCP resources
- `GET /mcp/tools`: Get available MCP tools
- `POST /mcp/execute`: Execute an MCP tool
  - Request body: `{ "toolName": "get_dog_description", "parameters": { "breed": "Labrador" } }`

## MCP Tools

### get_dog_description

Generates a detailed description for a dog breed.

Parameters:
- `breed` (string, required): The name of the dog breed
- `characteristics` (array, optional): Specific characteristics to include in the description

### get_dog_care_tips

Generates care tips for a dog breed.

Parameters:
- `breed` (string, required): The name of the dog breed
- `age` (string, optional): The age of the dog
- `lifestyle` (string, optional): The lifestyle of the owner

### get_breed_match

Finds dog breeds that match given criteria.

Parameters:
- `criteria` (object, required): Criteria for matching dog breeds (size, temperament, etc.)

## License

ISC
# The-Dog-API-MCP
