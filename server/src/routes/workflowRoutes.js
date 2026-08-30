const express = require('express');
const { body, param } = require('express-validator');
const workflowController = require('../controllers/workflowController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validation');

const router = express.Router();

router.use(protect);

// Dashboard metrics aggregation
router.get('/dashboard', workflowController.getDashboard);

// List user workflows
router.get('/', workflowController.getWorkflows);

// Create workflow manually
router.post(
  '/',
  [body('name').trim().notEmpty().withMessage('Workflow name is required')],
  validate,
  workflowController.createWorkflow
);

// Generate workflow graph from prompt via AI
router.post(
  '/generate',
  [body('prompt').trim().notEmpty().withMessage('Prompt cannot be empty')],
  validate,
  workflowController.generateWorkflow
);

// Fetch single workflow details
router.get('/:id', [param('id').isMongoId().withMessage('Invalid workflow ID')], validate, workflowController.getWorkflowById);

// Update existing workflow structure
router.put('/:id', [param('id').isMongoId().withMessage('Invalid workflow ID')], validate, workflowController.updateWorkflow);

// Clone workflow
router.post('/:id/duplicate', [param('id').isMongoId().withMessage('Invalid workflow ID')], validate, workflowController.duplicateWorkflow);

// Trigger an execution run on demand
router.post('/:id/execute', [param('id').isMongoId().withMessage('Invalid workflow ID')], validate, workflowController.executeWorkflow);

// Delete workflow
router.delete('/:id', [param('id').isMongoId().withMessage('Invalid workflow ID')], validate, workflowController.deleteWorkflow);

module.exports = router;
