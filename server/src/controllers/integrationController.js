const integrationService = require('../services/integrationService');

class IntegrationController {
  async getIntegrations(req, res, next) {
    try {
      const integrations = await integrationService.getUserIntegrations(req.user.id);
      res.json({ success: true, data: { integrations } });
    } catch (err) {
      next(err);
    }
  }

  async getStatus(req, res, next) {
    try {
      const integrations = await integrationService.getUserIntegrations(req.user.id);
      const connectedCount = integrations.filter((i) => i.isConnected).length;
      res.json({
        success: true,
        data: {
          total: integrations.length,
          connectedCount,
          providers: integrations,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async startOAuth(req, res, next) {
    try {
      const { provider } = req.params;
      const url = integrationService.getOAuthStartUrl(provider);
      res.json({ success: true, data: { url } });
    } catch (err) {
      next(err);
    }
  }

  async oauthCallback(req, res, next) {
    try {
      const { provider } = req.params;
      const { code } = req.query;
      const result = await integrationService.handleOAuthCallback(req.user.id, provider, code);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async oauthError(req, res) {
    const { error, error_description } = req.query;
    res.status(400).json({
      success: false,
      error: {
        code: 'OAUTH_FLOW_ERROR',
        message: error_description || error || 'OAuth authentication failed',
      },
    });
  }

  async saveCredentials(req, res, next) {
    try {
      const { provider, credentials } = req.body;
      const result = await integrationService.saveCredentials(req.user.id, provider, credentials);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async testConnection(req, res, next) {
    try {
      const { provider } = req.params;
      const result = await integrationService.testIntegration(req.user.id, provider);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async disconnect(req, res, next) {
    try {
      const { provider } = req.params;
      const result = await integrationService.disconnectIntegration(req.user.id, provider);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new IntegrationController();
