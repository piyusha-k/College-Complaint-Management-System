/**
 * Base Integration Class
 * Wraps third-party SDKs behind a unified interface.
 */
class BaseIntegration {
  constructor(name, provider) {
    this.name = name;
    this.provider = provider;
  }

  /**
   * Test the validity of credentials
   * @param {Object} credentials - Decrypted credentials object
   * @returns {Promise<{success: boolean, message: string, details?: any}>}
   */
  async testConnection(credentials) {
    throw new Error(`testConnection not implemented in ${this.constructor.name}`);
  }

  /**
   * Execute an integration action
   * @param {string} action - Action name (e.g., 'send_email', 'post_message')
   * @param {Object} params - Action parameters
   * @param {Object} credentials - Decrypted credentials object
   * @returns {Promise<any>}
   */
  async execute(action, params, credentials) {
    throw new Error(`execute not implemented in ${this.constructor.name}`);
  }

  /**
   * Get status & metadata
   */
  getStatus() {
    return {
      name: this.name,
      provider: this.provider,
    };
  }
}

module.exports = BaseIntegration;
