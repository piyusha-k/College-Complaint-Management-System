/**
 * Recovery Agent
 * Classifies failures and determines recovery action (retry_with_backoff vs escalate).
 */
class RecoveryAgent {
  constructor() {
    this.name = 'Recovery Agent';
    this.role = 'recovery';
  }

  /**
   * Classify error and decide recovery strategy
   * @param {Error|Object} error - Error thrown during execution or validation
   * @param {number} currentRetryCount - Current attempt index
   * @param {number} maxRetries - Maximum allowed retries (default 3)
   */
  classifyAndDecide(error, currentRetryCount = 0, maxRetries = 3) {
    const errorMsg = (error.message || '').toLowerCase();
    const errorCode = error.code || error.errorType || '';

    let errorCategory = 'TRANSIENT';
    let strategy = 'retry_with_backoff';
    let backoffMs = 1000 * Math.pow(2, currentRetryCount); // Exponential: 1s, 2s, 4s

    // Classification logic
    if (errorCode === 'AUTH_EXPIRED' || errorMsg.includes('unauthorized') || errorMsg.includes('auth expired') || errorMsg.includes('invalid_auth')) {
      errorCategory = 'AUTH_EXPIRED';
      strategy = 'escalate'; // Can't recover without user re-authenticating
    } else if (errorCode === 'INTEGRATION_NOT_CONNECTED' || errorMsg.includes('not connected')) {
      errorCategory = 'INTEGRATION_NOT_CONNECTED';
      strategy = 'escalate';
    } else if (errorCode === 'MISSING_FIELDS' || errorMsg.includes('required') || errorMsg.includes('missing')) {
      errorCategory = 'MISSING_FIELDS';
      strategy = 'escalate'; // Schema errors need input fixing
    } else if (errorMsg.includes('rate limit') || errorMsg.includes('429') || errorCode === 'RATE_LIMIT') {
      errorCategory = 'RATE_LIMIT';
      strategy = currentRetryCount < maxRetries ? 'retry_with_backoff' : 'escalate';
      backoffMs = 3000 * (currentRetryCount + 1);
    } else if (errorMsg.includes('econnreset') || errorMsg.includes('timeout') || errorMsg.includes('socket')) {
      errorCategory = 'TRANSIENT';
      strategy = currentRetryCount < maxRetries ? 'retry_with_backoff' : 'escalate';
    } else {
      errorCategory = 'API_FAILURE';
      strategy = currentRetryCount < maxRetries ? 'retry_with_backoff' : 'escalate';
    }

    return {
      errorCategory,
      strategy,
      backoffMs,
      canRetry: strategy === 'retry_with_backoff',
      recommendation:
        strategy === 'retry_with_backoff'
          ? `Transient failure detected (${errorCategory}). Retrying node execution with exponential backoff (${backoffMs}ms)...`
          : `Unrecoverable error (${errorCategory}): "${error.message}". Escalating to operator console.`,
    };
  }
}

module.exports = new RecoveryAgent();
