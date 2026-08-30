const Execution = require('../models/Execution');
const ExecutionLog = require('../models/ExecutionLog');
const { broadcastExecutionStatus, broadcastAgentEvent } = require('../config/socket');
const { addExecutionJob } = require('../queues/executionQueue');

class ExecutionService {
  /**
   * List executions with pagination and status filter
   */
  async getExecutions(userId, { page = 1, limit = 20, status = '', workflowId = '' } = {}) {
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (workflowId) {
      query.workflowId = workflowId;
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [executions, total] = await Promise.all([
      Execution.find(query)
        .populate({ path: 'workflowId', select: 'name description owner' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      Execution.countDocuments(query),
    ]);

    // Filter by user ownership if populated
    const userExecutions = executions.filter((e) => !e.workflowId || e.workflowId.owner?.toString() === userId.toString());

    return {
      executions: userExecutions,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        totalPages: Math.ceil(total / parseInt(limit, 10)),
      },
    };
  }

  /**
   * Get single execution run details
   */
  async getExecutionById(executionId, userId) {
    const execution = await Execution.findById(executionId).populate('workflowId');
    if (!execution) {
      const err = new Error('Execution not found');
      err.statusCode = 404;
      throw err;
    }
    return execution;
  }

  /**
   * Get execution timeline logs
   */
  async getExecutionTimeline(executionId, userId) {
    const execution = await this.getExecutionById(executionId, userId);
    const logs = await ExecutionLog.find({ executionId: execution._id }).sort({ timestamp: 1, createdAt: 1 });
    return {
      execution,
      logs,
    };
  }

  /**
   * Pause execution
   */
  async pauseExecution(executionId, userId) {
    const execution = await this.getExecutionById(executionId, userId);
    if (execution.status !== 'RUNNING' && execution.status !== 'PENDING') {
      const err = new Error(`Cannot pause execution in "${execution.status}" status`);
      err.statusCode = 400;
      throw err;
    }

    execution.status = 'PAUSED';
    await execution.save();

    broadcastExecutionStatus(executionId.toString(), { status: 'PAUSED' });
    return { success: true, status: 'PAUSED', message: 'Execution paused' };
  }

  /**
   * Resume execution
   */
  async resumeExecution(executionId, userId) {
    const execution = await this.getExecutionById(executionId, userId);
    if (execution.status !== 'PAUSED') {
      const err = new Error(`Cannot resume execution in "${execution.status}" status`);
      err.statusCode = 400;
      throw err;
    }

    execution.status = 'PENDING';
    await execution.save();

    // Re-enqueue execution job
    await addExecutionJob(execution._id.toString(), userId.toString());
    broadcastExecutionStatus(executionId.toString(), { status: 'PENDING' });

    return { success: true, status: 'PENDING', message: 'Execution resumed and queued' };
  }

  /**
   * Cancel execution
   */
  async cancelExecution(executionId, userId) {
    const execution = await this.getExecutionById(executionId, userId);
    if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(execution.status)) {
      const err = new Error(`Cannot cancel execution already in "${execution.status}" status`);
      err.statusCode = 400;
      throw err;
    }

    execution.status = 'CANCELLED';
    execution.endTime = new Date();
    execution.duration = Date.now() - (execution.startTime ? new Date(execution.startTime).getTime() : Date.now());
    await execution.save();

    broadcastExecutionStatus(executionId.toString(), {
      status: 'CANCELLED',
      endTime: execution.endTime,
      duration: execution.duration,
    });

    return { success: true, status: 'CANCELLED', message: 'Execution cancelled' };
  }
}

module.exports = new ExecutionService();
