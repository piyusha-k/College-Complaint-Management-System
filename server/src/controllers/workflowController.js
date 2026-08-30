const workflowService = require('../services/workflowService');
const aiService = require('../services/aiService');

class WorkflowController {
  async getDashboard(req, res, next) {
    try {
      const stats = await workflowService.getDashboardStats(req.user.id);
      res.json({ success: true, data: stats });
    } catch (err) {
      next(err);
    }
  }

  async getWorkflows(req, res, next) {
    try {
      const { page, limit, search, status, tag } = req.query;
      const result = await workflowService.getWorkflows(req.user.id, { page, limit, search, status, tag });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async createWorkflow(req, res, next) {
    try {
      const workflow = await workflowService.createWorkflow(req.user.id, req.body);
      res.status(201).json({ success: true, data: { workflow } });
    } catch (err) {
      next(err);
    }
  }

  async generateWorkflow(req, res, next) {
    try {
      const { prompt } = req.body;
      const generated = await aiService.generateWorkflowFromPrompt(prompt);
      res.json({ success: true, data: { workflow: generated } });
    } catch (err) {
      next(err);
    }
  }

  async getWorkflowById(req, res, next) {
    try {
      const workflow = await workflowService.getWorkflowById(req.params.id, req.user.id);
      res.json({ success: true, data: { workflow } });
    } catch (err) {
      next(err);
    }
  }

  async updateWorkflow(req, res, next) {
    try {
      const workflow = await workflowService.updateWorkflow(req.params.id, req.user.id, req.body);
      res.json({ success: true, data: { workflow } });
    } catch (err) {
      next(err);
    }
  }

  async duplicateWorkflow(req, res, next) {
    try {
      const clone = await workflowService.duplicateWorkflow(req.params.id, req.user.id);
      res.status(201).json({ success: true, data: { workflow: clone } });
    } catch (err) {
      next(err);
    }
  }

  async executeWorkflow(req, res, next) {
    try {
      const { inputs } = req.body || {};
      const result = await workflowService.executeWorkflow(req.params.id, req.user.id, inputs);
      res.status(202).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async deleteWorkflow(req, res, next) {
    try {
      const result = await workflowService.deleteWorkflow(req.params.id, req.user.id);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new WorkflowController();
