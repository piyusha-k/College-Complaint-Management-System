/**
 * Validation Agent
 * Verifies required output fields, schema constraints, and data integrity.
 */
class ValidationAgent {
  constructor() {
    this.name = 'Validation Agent';
    this.role = 'validation';
  }

  /**
   * Validate node execution output against expectations
   */
  async validate({ node, executionResult }) {
    const { output, service, action } = executionResult;

    if (output === null || output === undefined) {
      return {
        isValid: false,
        errorType: 'MISSING_FIELDS',
        message: `Validation failed: Node [${node.id}] produced empty or undefined output.`,
        details: { expectedNonEmpty: true, actual: output },
      };
    }

    // Provider specific validation
    if (service === 'gmail' && (action === 'send_email' || action === 'sendEmail')) {
      if (!output.to && !output.messageId) {
        return {
          isValid: false,
          errorType: 'MISSING_FIELDS',
          message: `Validation failed: Gmail output missing "to" or "messageId".`,
          details: output,
        };
      }
    }

    if (service === 'slack' && (action === 'post_message' || action === 'postMessage')) {
      if (output.status !== 'POSTED') {
        return {
          isValid: false,
          errorType: 'API_FAILURE',
          message: `Validation failed: Slack status is not "POSTED".`,
          details: output,
        };
      }
    }

    return {
      isValid: true,
      message: `Node [${node.id}] output validated successfully.`,
      validatedKeys: Object.keys(output || {}),
    };
  }
}

module.exports = new ValidationAgent();
