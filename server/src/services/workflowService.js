const Workflow = require('../models/Workflow');
const Execution = require('../models/Execution');
const ExecutionLog = require('../models/ExecutionLog');
const { addExecutionJob } = require('../queues/executionQueue');

class WorkflowService {
  /**
   * List user workflows with pagination, search, and filtering
   */
  async getWorkflows(userId, { page = 1, limit = 20, search = '', status = '', tag = '' } = {}) {
    const query = { owner: userId };

    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (tag && tag !== 'all') {
      query.tags = tag;
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [workflows, total] = await Promise.all([
      Workflow.find(query).sort({ updatedAt: -1 }).skip(skip).limit(parseInt(limit, 10)),
      Workflow.countDocuments(query),
    ]);

    return {
      workflows,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        totalPages: Math.ceil(total / parseInt(limit, 10)),
      },
    };
  }

  /**
   * Get single workflow by ID
   */
  async getWorkflowById(workflowId, userId) {
    const workflow = await Workflow.findOne({ _id: workflowId, owner: userId });
    if (!workflow) {
      const err = new Error('Workflow not found');
      err.statusCode = 404;
      throw err;
    }
    return workflow;
  }

  /**
   * Create workflow manually
   */
  async createWorkflow(userId, data) {
    const workflow = new Workflow({
      name: data.name || 'Untitled Automation',
      description: data.description || '',
      owner: userId,
      status: data.status || 'draft',
      triggerConfig: data.triggerConfig || { type: 'manual' },
      nodes: data.nodes || [],
      edges: data.edges || [],
      tags: data.tags || ['Custom'],
      version: 1,
    });

    await workflow.save();
    return workflow;
  }

  /**
   * Update workflow structure
   */
  async updateWorkflow(workflowId, userId, data) {
    const workflow = await Workflow.findOne({ _id: workflowId, owner: userId });
    if (!workflow) {
      const err = new Error('Workflow not found');
      err.statusCode = 404;
      throw err;
    }

    if (data.name !== undefined) workflow.name = data.name;
    if (data.description !== undefined) workflow.description = data.description;
    if (data.status !== undefined) workflow.status = data.status;
    if (data.triggerConfig !== undefined) workflow.triggerConfig = data.triggerConfig;
    if (data.nodes !== undefined) workflow.nodes = data.nodes;
    if (data.edges !== undefined) workflow.edges = data.edges;
    if (data.tags !== undefined) workflow.tags = data.tags;

    // Increment version upon structural edit
    if (data.nodes !== undefined || data.edges !== undefined) {
      workflow.version = (workflow.version || 1) + 1;
    }

    await workflow.save();
    return workflow;
  }

  /**
   * Duplicate workflow
   */
  async duplicateWorkflow(workflowId, userId) {
    const original = await this.getWorkflowById(workflowId, userId);
    const clone = new Workflow({
      name: `${original.name} (Copy)`,
      description: original.description,
      owner: userId,
      status: 'draft',
      triggerConfig: original.triggerConfig,
      nodes: original.nodes,
      edges: original.edges,
      tags: original.tags,
      version: 1,
    });

    await clone.save();
    return clone;
  }

  /**
   * Delete workflow
   */
  async deleteWorkflow(workflowId, userId) {
    const workflow = await Workflow.findOneAndDelete({ _id: workflowId, owner: userId });
    if (!workflow) {
      const err = new Error('Workflow not found');
      err.statusCode = 404;
      throw err;
    }
    return { success: true, message: 'Workflow deleted successfully' };
  }

  /**
   * Trigger workflow execution on demand
   */
  async executeWorkflow(workflowId, userId, inputs = {}) {
    const workflow = await this.getWorkflowById(workflowId, userId);

    // Create execution document with snapshot
    const execution = new Execution({
      workflowId: workflow._id,
      workflowSnapshot: {
        name: workflow.name,
        description: workflow.description,
        nodes: workflow.nodes,
        edges: workflow.edges,
        triggerConfig: workflow.triggerConfig,
        version: workflow.version,
      },
      status: 'PENDING',
      inputs,
      retryCount: 0,
    });

    await execution.save();

    // Enqueue job via BullMQ / InMemoryQueue
    await addExecutionJob(execution._id.toString(), userId.toString());

    return {
      executionId: execution._id,
      status: execution.status,
      workflowId: workflow._id,
      message: 'Workflow execution queued successfully',
    };
  }

  /**
   * Aggregated dashboard metrics for operator console
   */
  async getDashboardStats(userId) {
    const [totalWorkflows, activeWorkflows, executions] = await Promise.all([
      Workflow.countDocuments({ owner: userId }),
      Workflow.countDocuments({ owner: userId, status: 'active' }),
      Execution.find()
        .populate({ path: 'workflowId', match: { owner: userId } })
        .sort({ createdAt: -1 })
        .limit(100),
    ]);

    // Filter executions owned by user
    const userExecutions = executions.filter((e) => e.workflowId !== null);
    const totalExecutions = userExecutions.length;
    const completedExecutions = userExecutions.filter((e) => e.status === 'COMPLETED').length;
    const failedExecutions = userExecutions.filter((e) => e.status === 'FAILED').length;
    const runningExecutions = userExecutions.filter((e) => e.status === 'RUNNING' || e.status === 'PENDING').length;

    const successRate = totalExecutions > 0 ? Math.round((completedExecutions / totalExecutions) * 100) : 100;
    const avgDuration =
      completedExecutions > 0
        ? Math.round(
            userExecutions.filter((e) => e.status === 'COMPLETED').reduce((acc, curr) => acc + (curr.duration || 0), 0) /
              completedExecutions
          )
        : 0;

    const recentExecutions = userExecutions.slice(0, 8).map((e) => ({
      id: e._id,
      workflowName: e.workflowSnapshot?.name || e.workflowId?.name || 'Automation',
      status: e.status,
      duration: e.duration,
      retryCount: e.retryCount,
      startTime: e.startTime || e.createdAt,
      endTime: e.endTime,
      confidence: e.agentMetrics?.plannerConfidence || 0.95,
      langGraph: e.agentMetrics?.langGraph || 'available',
    }));

    // Fetch recent live agent activity feed
    const recentLogs = await ExecutionLog.find()
      .sort({ createdAt: -1 })
      .limit(12)
      .populate('workflowId', 'name');

    const activityFeed = recentLogs.map((l) => ({
      id: l._id,
      agent: l.agent,
      level: l.level,
      message: l.message,
      timestamp: l.timestamp || l.createdAt,
      workflowName: l.workflowId?.name || 'Pipeline',
      nodeId: l.nodeId,
    }));

    return {
      metrics: {
        totalWorkflows,
        activeWorkflows,
        totalExecutions,
        completedExecutions,
        failedExecutions,
        runningExecutions,
        successRate,
        avgDurationMs: avgDuration,
      },
      recentExecutions,
      activityFeed,
    };
  }
}

module.exports = new WorkflowService();
