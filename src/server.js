const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { smartsheetApiRouter } = require('./routes/smartsheetApi');
const { openaiRouter } = require('./routes/openai');
const { mcpRouter } = require('./routes/mcp');
const { staticRouter } = require('./routes/static');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/smartsheet', smartsheetApiRouter);
app.use('/api/openai', openaiRouter);
app.use('/mcp', mcpRouter);
app.use('/', staticRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Smartsheet MCP Server',
    endpoints: {
      '/api/smartsheet': 'Smartsheet API endpoints',
      '/api/openai': 'OpenAI endpoints',
      '/mcp': 'MCP endpoints'
    }
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
