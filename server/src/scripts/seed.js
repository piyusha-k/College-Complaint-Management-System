const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const User = require('../models/User');
const Workflow = require('../models/Workflow');
const Integration = require('../models/Integration');
const { encryptCredentials } = require('../services/integrationService');

const seedData = async () => {
  try {
    await connectDB();

    console.log('[Seed] Seeding default operator & demo workflows...');

    // 1. Create or ensure operator user
    let operator = await User.findOne({ email: 'operator@agentflow.ai' });
    if (!operator) {
      operator = new User({
        name: 'Alex Mercer (Lead Operator)',
        email: 'operator@agentflow.ai',
        password: 'Password123!',
        role: 'operator',
      });
      await operator.save();
      console.log('[Seed] Created default operator: operator@agentflow.ai / Password123!');
    }

    let admin = await User.findOne({ email: 'admin@agentflow.ai' });
    if (!admin) {
      admin = new User({
        name: 'System Administrator',
        email: 'admin@agentflow.ai',
        password: 'Password123!',
        role: 'admin',
      });
      await admin.save();
      console.log('[Seed] Created default admin: admin@agentflow.ai / Password123!');
    }

    // 2. Pre-seed default active workflows if none exist
    const count = await Workflow.countDocuments({ owner: operator._id });
    if (count === 0) {
      const demoWorkflows = [
        {
          name: 'Customer Support AI Triage & Resolution',
          description: 'Monitors incoming support requests, classifies urgency with AI, auto-replies via Gmail, and alerts Slack.',
          owner: operator._id,
          status: 'active',
          triggerConfig: { type: 'webhook', eventSource: 'zendesk_webhook' },
          tags: ['Support', 'AI Agent', 'Gmail', 'Slack'],
          version: 1,
          nodes: [
            {
              id: 'node_1',
              type: 'trigger',
              position: { x: 250, y: 40 },
              data: {
                label: 'Support Ticket Webhook',
                description: 'Receives ticket payload from support portal',
                service: 'custom',
                action: 'webhook',
                config: { endpoint: '/api/v1/support-tickets' },
              },
            },
            {
              id: 'node_2',
              type: 'agent',
              position: { x: 250, y: 180 },
              data: {
                label: 'AI Sentiment & Urgency Agent',
                description: 'Analyzes ticket text and scores priority',
                service: 'gemini',
                action: 'analyze_sentiment',
                config: { prompt: 'Determine urgency level and summarize core issue.' },
              },
            },
            {
              id: 'node_3',
              type: 'integration',
              position: { x: 100, y: 340 },
              data: {
                label: 'Gmail Auto-Responder',
                description: 'Sends confirmation and next steps to customer',
                service: 'gmail',
                action: 'send_email',
                config: { to: 'support-client@example.com', subject: 'We have received your ticket' },
              },
            },
            {
              id: 'node_4',
              type: 'integration',
              position: { x: 400, y: 340 },
              data: {
                label: 'Slack Urgent Alert',
                description: 'Alerts #tier1-support channel on high priority',
                service: 'slack',
                action: 'post_message',
                config: { channel: '#support-alerts', text: 'Urgent ticket processed by Agentflow AI' },
              },
            },
          ],
          edges: [
            { id: 'e1_2', source: 'node_1', target: 'node_2', animated: true },
            { id: 'e2_3', source: 'node_2', target: 'node_3', animated: true },
            { id: 'e2_4', source: 'node_2', target: 'node_4', animated: true },
          ],
        },
        {
          name: 'Invoice Ingestion & Spreadsheet Sync',
          description: 'Extracts invoices, calculates taxes, updates Google Sheets ledger, and posts Discord notification.',
          owner: operator._id,
          status: 'active',
          triggerConfig: { type: 'manual' },
          tags: ['Finance', 'Google Sheets', 'Discord', 'AI Extraction'],
          version: 1,
          nodes: [
            {
              id: 'node_1',
              type: 'trigger',
              position: { x: 250, y: 40 },
              data: {
                label: 'Manual Run Trigger',
                description: 'Executed on demand or via schedule',
                service: 'custom',
                action: 'manual',
                config: {},
              },
            },
            {
              id: 'node_2',
              type: 'agent',
              position: { x: 250, y: 180 },
              data: {
                label: 'AI Invoice Extraction Agent',
                description: 'Extracts amounts, VAT, vendor ID, and due date',
                service: 'openai',
                action: 'extract_entities',
                config: { target: 'vendor_name, total_amount, invoice_id' },
              },
            },
            {
              id: 'node_3',
              type: 'integration',
              position: { x: 250, y: 320 },
              data: {
                label: 'Google Sheets Append',
                description: 'Appends new line to Corporate Ledger spreadsheet',
                service: 'google-sheets',
                action: 'append_row',
                config: { spreadsheetId: 'fin-sheet-2026', range: 'Ledger!A:F' },
              },
            },
            {
              id: 'node_4',
              type: 'integration',
              position: { x: 250, y: 460 },
              data: {
                label: 'Discord Notification',
                description: 'Sends confirmation embed to Discord channel',
                service: 'discord',
                action: 'post_message',
                config: { channel: '#finance-ops', text: 'Invoice ledger updated successfully' },
              },
            },
          ],
          edges: [
            { id: 'e1_2', source: 'node_1', target: 'node_2', animated: true },
            { id: 'e2_3', source: 'node_2', target: 'node_3', animated: true },
            { id: 'e3_4', source: 'node_3', target: 'node_4', animated: true },
          ],
        },
      ];

      await Workflow.insertMany(demoWorkflows);
      console.log('[Seed] Seeded 2 demo workflows successfully.');
    }

    console.log('[Seed] Seeding completed.');
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Error during seeding:', err);
    process.exit(1);
  }
};

seedData();
