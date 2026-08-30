const BaseIntegration = require('./baseIntegration');
const axios = require('axios');

class SlackIntegration extends BaseIntegration {
  constructor() {
    super('Slack', 'slack');
  }

  async testConnection(credentials) {
    if (!credentials || (!credentials.accessToken && !credentials.webhookUrl)) {
      return {
        success: false,
        errorType: 'INTEGRATION_NOT_CONNECTED',
        message: 'Slack is not connected. Missing Bot Token or Webhook URL.',
      };
    }

    try {
      if (credentials.accessToken && !credentials.accessToken.startsWith('demo_')) {
        const res = await axios.get('https://slack.com/api/auth.test', {
          headers: { Authorization: `Bearer ${credentials.accessToken}` },
          timeout: 5000,
        });

        if (!res.data.ok) {
          return {
            success: false,
            errorType: 'AUTH_EXPIRED',
            message: `Slack auth failed: ${res.data.error}`,
          };
        }

        return {
          success: true,
          message: `Connected to Slack team: ${res.data.team}`,
          account: `${res.data.user} @ ${res.data.team}`,
        };
      }

      return {
        success: true,
        message: 'Slack configured (Sandbox / Webhook mode)',
        account: '#general (Workspace)',
      };
    } catch (err) {
      return {
        success: false,
        errorType: 'API_FAILURE',
        message: err.message,
      };
    }
  }

  async execute(action, params = {}, credentials = {}) {
    if (!credentials || (!credentials.accessToken && !credentials.webhookUrl)) {
      const err = new Error('Slack integration is not connected');
      err.code = 'INTEGRATION_NOT_CONNECTED';
      throw err;
    }

    switch (action) {
      case 'post_message':
      case 'postMessage':
      case 'send_message': {
        const { channel = '#general', text, blocks } = params;
        if (!text && !blocks) {
          const err = new Error('Message text or blocks is required for Slack post_message');
          err.code = 'MISSING_FIELDS';
          throw err;
        }

        // Real Webhook or Bot Token call
        if (credentials.webhookUrl) {
          try {
            await axios.post(credentials.webhookUrl, { text, channel });
            return {
              status: 'POSTED',
              channel,
              text,
              timestamp: new Date().toISOString(),
            };
          } catch (err) {
            const error = new Error(`Slack webhook error: ${err.message}`);
            error.code = 'API_FAILURE';
            throw error;
          }
        }

        if (credentials.accessToken && !credentials.accessToken.startsWith('demo_')) {
          try {
            const res = await axios.post(
              'https://slack.com/api/chat.postMessage',
              { channel, text, blocks },
              {
                headers: {
                  Authorization: `Bearer ${credentials.accessToken}`,
                  'Content-Type': 'application/json',
                },
              }
            );

            if (!res.data.ok) {
              const err = new Error(`Slack API error: ${res.data.error}`);
              err.code = res.data.error === 'invalid_auth' ? 'AUTH_EXPIRED' : 'API_FAILURE';
              throw err;
            }

            return {
              status: 'POSTED',
              channel,
              ts: res.data.ts,
              message: res.data.message,
            };
          } catch (err) {
            if (!err.code) err.code = 'API_FAILURE';
            throw err;
          }
        }

        // Sandbox execution
        return {
          status: 'POSTED',
          channel,
          text,
          simulated: true,
          ts: `${Date.now()}.000100`,
        };
      }

      default:
        throw new Error(`Unsupported action "${action}" for Slack integration`);
    }
  }
}

module.exports = new SlackIntegration();
