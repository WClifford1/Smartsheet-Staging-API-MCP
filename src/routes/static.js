const express = require('express');
const path = require('path');

const router = express.Router();

// Serve static files from the public directory
router.use(express.static(path.join(__dirname, '../../public')));

// Serve index.html for the root route
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

module.exports = { staticRouter: router };
