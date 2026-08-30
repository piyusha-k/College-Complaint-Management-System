const express = require('express');
const { param } = require('express-validator');
const executionController = require('../controllers/executionController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validation');

const router = express.Router();

router.use(protect);

// List all execution runs
router.get('/', executionController.getExecutions);

// Fetch execution run details and snapshot
router.get('/:id', [param('id').isMongoId().withMessage('Invalid execution ID')], validate, executionController.getExecutionById);

// Fetch detailed agent timeline logs
router.get('/:id/timeline', [param('id').isMongoId().withMessage('Invalid execution ID')], validate, executionController.getTimeline);

// Pause active run
router.post('/:id/pause', [param('id').isMongoId().withMessage('Invalid execution ID')], validate, executionController.pauseExecution);

// Resume paused run
router.post('/:id/resume', [param('id').isMongoId().withMessage('Invalid execution ID')], validate, executionController.resumeExecution);

// Cancel running execution
router.post('/:id/cancel', [param('id').isMongoId().withMessage('Invalid execution ID')], validate, executionController.cancelExecution);

module.exports = router;
