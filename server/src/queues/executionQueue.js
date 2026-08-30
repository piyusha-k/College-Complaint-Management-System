const { Queue, Worker } = require('bullmq');
const Redis = require('ioredis');
const env = require('../config/env');
const orchestrator = require('../agents/orchestrator');

let executionQueue = null;
let queueWorker = null;
let isUsingInMemoryQueue = false;

// Simple in-memory asynchronous queue fallback
class InMemoryQueue {
  constructor() {
    this.tasks = [];
    this.isProcessing = false;
  }

  async add(name, data, opts = {}) {
    const job = { id: `mem_job_${Date.now()}_${Math.random().toString(36).substring(7)}`, name, data, opts };
    console.log(`[InMemoryQueue] Enqueued job ${job.id} for execution ${data.executionId}`);
    
    // Process asynchronously
    setImmediate(async () => {
      try {
        await orchestrator.runExecution(data.executionId, data.userId);
      } catch (err) {
        console.error(`[InMemoryQueue] Job ${job.id} execution failed:`, err.message);
      }
    });

    return job;
  }
}

const initQueue = () => {
  if (env.REDIS_URL && env.REDIS_URL.trim() !== '') {
    try {
      console.log('[Queue] Initializing BullMQ with Redis at', env.REDIS_URL.split('@')[1] || env.REDIS_URL);
      const redisConnection = new Redis(env.REDIS_URL, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        retryStrategy: () => 3000,
      });

      redisConnection.on('error', (err) => {
        console.warn(`[Queue] Redis connection error: ${err.message}. Fallback to InMemoryQueue.`);
        isUsingInMemoryQueue = true;
        executionQueue = new InMemoryQueue();
      });

      executionQueue = new Queue('workflow-executions', { connection: redisConnection });

      queueWorker = new Worker(
        'workflow-executions',
        async (job) => {
          console.log(`[BullMQ Worker] Processing job ${job.id} for execution ${job.data.executionId}`);
          await orchestrator.runExecution(job.data.executionId, job.data.userId);
        },
        { connection: redisConnection }
      );

      queueWorker.on('completed', (job) => {
        console.log(`[BullMQ Worker] Job ${job.id} completed successfully`);
      });

      queueWorker.on('failed', (job, err) => {
        console.error(`[BullMQ Worker] Job ${job?.id} failed:`, err.message);
      });

      console.log('[Queue] BullMQ and Redis initialized successfully.');
      return;
    } catch (err) {
      console.warn(`[Queue] BullMQ initialization failed: ${err.message}. Using InMemoryQueue fallback.`);
    }
  }

  console.log('[Queue] No REDIS_URL configured or Redis unavailable. Using zero-config InMemoryQueue.');
  isUsingInMemoryQueue = true;
  executionQueue = new InMemoryQueue();
};

const addExecutionJob = async (executionId, userId, options = {}) => {
  if (!executionQueue) {
    initQueue();
  }
  return executionQueue.add('execute-workflow', { executionId, userId }, options);
};

module.exports = {
  initQueue,
  addExecutionJob,
  isInMemory: () => isUsingInMemoryQueue,
};
