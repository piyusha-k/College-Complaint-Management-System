const BaseIntegration = require('./baseIntegration');
const axios = require('axios');

class DiscordIntegration extends BaseIntegration {
  constructor() {
    super('Discord', 'discord');
  }

  async testConnection(credentials) {
    if (!credentials || (!credentials.webhookUrl && !credentials.botToken)) {
      return {
        success: false,
        errorType: 'INTEGRATION_NOT_CONNECTED',
        message: 'Discord is not connected. Missing Webhook URL or Bot Token.',
      };
    }

    try {
      if (credentials.webhookUrl && credentials.webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
        const res = await axios.get(credentials.webhookUrl, { timeout: 5000 });
        return {
          success: true,
          message: `Connected to Discord Webhook: ${res.data.name || 'Bot'}`,
          account: `Guild #${res.data.guild_id || 'Webhook'}`,
        };
      }

      if (credentials.botToken && !credentials.botToken.startsWith('demo_')) {
        const res = await axios.get('https://discord.com/api/v10/users/@me', {
          headers: { Authorization: `Bot ${credentials.botToken}` },
          timeout: 5000,
        });
        return {
          success: true,
          message: `Connected as ${res.data.username}#${res.data.discriminator || '0'}`,
          account: res.data.username,
        };
      }

      return {
        success: true,
        message: 'Discord sandbox ready',
        account: '#general-alerts',
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
    if (!credentials || (!credentials.webhookUrl && !credentials.botToken)) {
      const err = new Error('Discord integration is not connected');
      err.code = 'INTEGRATION_NOT_CONNECTED';
      throw err;
    }

    switch (action) {
      case 'post_message':
      case 'postMessage':
      case 'send_alert': {
        const { content, embeds, username = 'Agentflow Bot' } = params;
        const textContent = content || (params.text || 'Automated Event Triggered');

        if (credentials.webhookUrl && credentials.webhookUrl.startsWith('https://discord.com/')) {
          try {
            await axios.post(credentials.webhookUrl, {
              content: textContent,
              username,
              embeds: embeds || [
                {
                  title: 'Agentflow AI Execution Event',
                  description: textContent,
                  color: 6511359, // Violet hex
                  timestamp: new Date().toISOString(),
                },
              ],
            });

            return {
              status: 'POSTED',
              target: 'Webhook',
              content: textContent,
              timestamp: new Date().toISOString(),
            };
          } catch (err) {
            const error = new Error(`Discord post error: ${err.message}`);
            error.code = 'API_FAILURE';
            throw error;
          }
        }

        return {
          status: 'POSTED',
          target: 'Discord Sandbox',
          content: textContent,
          simulated: true,
          id: `discord_${Date.now()}`,
        };
      }

      default:
        throw new Error(`Unsupported action "${action}" for Discord integration`);
    }
  }
}

module.exports = new DiscordIntegration();
