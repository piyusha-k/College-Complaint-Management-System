const mongoose = require('mongoose');

const executionSchema = new mongoose.Schema(
  {
    workflowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workflow',
      required: true,
    },
    workflowSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'RETRYING', 'PAUSED', 'CANCELLED'],
      default: 'PENDING',
    },
    currentNode: {
      type: String,
      default: null,
    },
    startTime: {
      type: Date,
      default: null,
    },
    endTime: {
      type: Date,
      default: null,
    },
    duration: {
      type: Number, // milliseconds
      default: 0,
    },
    inputs: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    outputs: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    nodeOutputs: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    error: {
      message: { type: String, default: null },
      code: { type: String, default: null },
      stack: { type: String, default: null },
      nodeId: { type: String, default: null },
      recovered: { type: Boolean, default: false },
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    agentMetrics: {
      plannerConfidence: { type: Number, default: 0 },
      langGraph: { type: String, enum: ['available', 'not-installed'], default: 'available' },
      executedNodesCount: { type: Number, default: 0 },
      recoveryAttempts: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Execution', executionSchema);
