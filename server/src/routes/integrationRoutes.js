const express = require('express');
const { body, param } = require('express-validator');
const integrationController = require('../controllers/integrationController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validation');

const router = express.Router();

// OAuth callback / error endpoints (may receive external redirect)
router.get('/oauth/error', integrationController.oauthError);

// Protected routes
router.use(protect);

// List all user integration connections
router.get('/', integrationController.getIntegrations);

// Provider health and token validity checks
router.get('/status', integrationController.getStatus);

// Initiate OAuth flow
router.get('/oauth/:provider/start', integrationController.startOAuth);

// Handle OAuth callback with token exchange
router.get('/oauth/:provider/callback', integrationController.oauthCallback);

// Manual integration credential setup
router.post(
  '/',
  [
    body('provider').isIn(['gmail', 'slack', 'google-sheets', 'discord', 'openrouter', 'gemini']).withMessage('Invalid provider'),
    body('credentials').isObject().withMessage('Credentials payload must be an object'),
  ],
  validate,
  integrationController.saveCredentials
);

// Test provider connection
router.post('/test/:provider', integrationController.testConnection);

// Disconnect provider
router.post('/disconnect/:provider', integrationController.disconnect);

module.exports = router;
