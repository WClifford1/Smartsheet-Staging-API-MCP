const express = require('express');
const { MCPService } = require('../services/mcpService');

const router = express.Router();
const mcpService = new MCPService();

// MCP resources endpoint
router.get('/resources', (req, res) => {
  const resources = mcpService.getResources();
  res.json(resources);
});

// MCP tools endpoint
router.get('/tools', (req, res) => {
  const tools = mcpService.getTools();
  res.json(tools);
});

// Execute MCP tool
router.post('/execute', async (req, res) => {
  try {
    const { toolName, parameters } = req.body;

    if (!toolName) {
      return res.status(400).json({ error: 'Tool name is required' });
    }

    const result = await mcpService.executeTool(toolName, parameters);
    res.json(result);
  } catch (error) {
    console.error('Error executing MCP tool:', error);
    res.status(500).json({ error: 'Failed to execute MCP tool' });
  }
});

module.exports = { mcpRouter: router };
