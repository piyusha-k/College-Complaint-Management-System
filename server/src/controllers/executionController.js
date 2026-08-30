const executionService = require('../services/executionService');

class ExecutionController {
  async getExecutions(req, res, next) {
    try {
      const { page, limit, status, workflowId } = req.query;
      const result = await executionService.getExecutions(req.user.id, { page, limit, status, workflowId });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getExecutionById(req, res, next) {
    try {
      const execution = await executionService.getExecutionById(req.params.id, req.user.id);
      res.json({ success: true, data: { execution } });
    } catch (err) {
      next(err);
    }
  }

  async getTimeline(req, res, next) {
    try {
      const result = await executionService.getExecutionTimeline(req.params.id, req.user.id);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async pauseExecution(req, res, next) {
    try {
      const result = await executionService.pauseExecution(req.params.id, req.user.id);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async resumeExecution(req, res, next) {
    try {
      const result = await executionService.resumeExecution(req.params.id, req.user.id);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async cancelExecution(req, res, next) {
    try {
      const result = await executionService.cancelExecution(req.params.id, req.user.id);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ExecutionController();
