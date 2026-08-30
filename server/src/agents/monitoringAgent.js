const ExecutionLog = require('../models/ExecutionLog');
const { broadcastAgentEvent } = require('../config/socket');

/**
 * Monitoring Agent
 * Emits granular timeline events, persists execution audit records, and notifies clients via WebSockets.
 */
class MonitoringAgent {
  constructor() {
    this.name = 'Monitoring Agent';
    this.role = 'monitoring';
  }

  /**
   * Log an agent timeline event
   */
  async logEvent({ executionId, workflowId, nodeId = null, agent, level = 'info', message, metadata = {} }) {
    try {
      const logEntry = new ExecutionLog({
        executionId,
        workflowId,
        nodeId,
        agent,
        level,
        message,
        metadata,
        timestamp: new Date(),
      });

      await logEntry.save();

      // Broadcast over Socket.IO to subscribed clients
      broadcastAgentEvent(executionId.toString(), {
        id: logEntry._id,
        executionId: executionId.toString(),
        workflowId: workflowId.toString(),
        nodeId,
        agent,
        level,
        message,
        metadata,
        timestamp: logEntry.timestamp,
      });

      return logEntry;
    } catch (err) {
      console.error('[MonitoringAgent] Failed to persist log event:', err.message);
    }
  }
}

module.exports = new MonitoringAgent();
