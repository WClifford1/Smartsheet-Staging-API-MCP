import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { dogApiRouter } from './routes/dogApi';
import { openaiRouter } from './routes/openai';
import { mcpRouter } from './routes/mcp';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/dogs', dogApiRouter);
app.use('/api/openai', openaiRouter);
app.use('/mcp', mcpRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Dog MCP Server',
    endpoints: {
      '/api/dogs': 'Dog API endpoints',
      '/api/openai': 'OpenAI endpoints',
      '/mcp': 'MCP endpoints'
    }
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
