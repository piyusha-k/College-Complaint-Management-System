const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../config/env');

const SYSTEM_PROMPT = `
You are an expert AI Operations Architect for Agentflow_AI.
Your job is to convert a natural language automation prompt into a visual workflow graph.
You must return a strictly valid JSON object (no markdown, no backticks, just raw JSON) matching this schema:
{
  "name": "Concise workflow name",
  "description": "Brief workflow explanation",
  "triggerConfig": {
    "type": "manual" | "webhook" | "schedule" | "event",
    "eventSource": "string (optional)",
    "cron": "string (optional)"
  },
  "tags": ["tag1", "tag2"],
  "nodes": [
    {
      "id": "node_1",
      "type": "trigger" | "action" | "agent" | "integration" | "condition",
      "position": { "x": 250, "y": 50 },
      "data": {
        "label": "Node label",
        "description": "Node description",
        "service": "gmail" | "slack" | "discord" | "google-sheets" | "openai" | "gemini" | "custom",
        "action": "send_email" | "post_message" | "append_row" | "read_range" | "analyze_sentiment" | "summarize" | "custom",
        "config": {
          "field1": "value1"
        }
      }
    }
  ],
  "edges": [
    {
      "id": "e_node_1_node_2",
      "source": "node_1",
      "target": "node_2",
      "animated": true,
      "label": "Optional condition or label"
    }
  ]
}

Available node types:
- 'trigger' (e.g., Webhook Trigger, Schedule Trigger, Email Received)
- 'agent' (e.g., AI Data Analyzer, Triage Classifier, Email Drafter)
- 'integration' (e.g., Gmail Send, Slack Post, Discord Alert, Google Sheets Append)
- 'condition' (e.g., Sentiment Filter, Urgent Check)

Arrange positions with vertical spacing of 120-150px and center alignment (x: 250).
`;

class AIService {
  /**
   * Main entry point to generate a workflow graph from prompt
   */
  async generateWorkflowFromPrompt(prompt) {
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      throw new Error('A descriptive prompt is required to generate a workflow');
    }

    // 1. Try OpenRouter if API key is provided
    if (env.OPENROUTER_API_KEY && env.OPENROUTER_API_KEY.trim() !== '') {
      try {
        console.log('[AIService] Generating workflow using OpenRouter API...');
        const workflow = await this.generateWithOpenRouter(prompt);
        if (workflow) return this.sanitizeWorkflow(workflow, prompt, 'OpenRouter (Claude 3.5 Sonnet / GPT-4o)');
      } catch (err) {
        console.warn('[AIService] OpenRouter generation failed, trying fallback:', err.message);
      }
    }

    // 2. Try Gemini if API key is provided
    if (env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim() !== '') {
      try {
        console.log('[AIService] Generating workflow using Google Gemini...');
        const workflow = await this.generateWithGemini(prompt);
        if (workflow) return this.sanitizeWorkflow(workflow, prompt, 'Google Gemini 1.5 Flash');
      } catch (err) {
        console.warn('[AIService] Gemini generation failed, trying deterministic fallback:', err.message);
      }
    }

    // 3. Fallback to deterministic rule-based builder
    console.log('[AIService] Using deterministic rule-based workflow builder fallback.');
    const deterministicGraph = this.generateDeterministicWorkflow(prompt);
    return this.sanitizeWorkflow(deterministicGraph, prompt, 'Deterministic Rule-Based Engine (Zero-Config)');
  }

  /**
   * OpenRouter Generator
   */
  async generateWithOpenRouter(prompt) {
    const res = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'anthropic/claude-3.5-sonnet:beta',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Generate an automation workflow for this prompt: "${prompt}"` },
        ],
        temperature: 0.2,
      },
      {
        headers: {
          Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://agentflow.ai',
          'X-Title': 'Agentflow AI Ops Platform',
        },
        timeout: 15000,
      }
    );

    const text = res.data.choices[0]?.message?.content || '';
    return this.parseJSONFromAI(text);
  }

  /**
   * Google Gemini Generator
   */
  async generateWithGemini(prompt) {
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent([
      { text: SYSTEM_PROMPT },
      { text: `Generate an automation workflow for this prompt: "${prompt}"` },
    ]);

    const text = result.response.text();
    return this.parseJSONFromAI(text);
  }

  /**
   * Parse JSON string from AI response safely
   */
  parseJSONFromAI(rawText) {
    let clean = rawText.trim();
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    return JSON.parse(clean);
  }

  /**
   * Deterministic Rule-Based Builder for Offline / Zero-Key Local Runs
   */
  generateDeterministicWorkflow(prompt) {
    const p = prompt.toLowerCase();

    // Pattern 1: Invoice routing / processing
    if (p.includes('invoice') || p.includes('bill') || p.includes('receipt') || p.includes('accounting')) {
      return {
        name: 'Automated Invoice Processing & Notification',
        description: 'Extracts incoming invoices, summarizes total amounts via AI, logs to Google Sheets, and alerts finance on Slack.',
        tags: ['Finance', 'Invoice', 'AI Analysis', 'Slack', 'Google Sheets'],
        triggerConfig: { type: 'webhook', eventSource: 'invoice_upload' },
        nodes: [
          {
            id: 'node_1',
            type: 'trigger',
            position: { x: 250, y: 40 },
            data: {
              label: 'Invoice Webhook Ingestion',
              description: 'Receives PDF/JSON invoice payload',
              service: 'custom',
              action: 'webhook',
              config: { endpoint: '/api/v1/invoices' },
            },
          },
          {
            id: 'node_2',
            type: 'agent',
            position: { x: 250, y: 180 },
            data: {
              label: 'AI Data Extraction Agent',
              description: 'Parses vendor, items, tax, and total amount',
              service: 'gemini',
              action: 'extract_entities',
              config: { extractionTarget: 'vendor_name, total_amount, due_date' },
            },
          },
          {
            id: 'node_3',
            type: 'integration',
            position: { x: 250, y: 320 },
            data: {
              label: 'Google Sheets Audit Log',
              description: 'Appends invoice row into Corporate Finance sheet',
              service: 'google-sheets',
              action: 'append_row',
              config: { spreadsheetId: 'finance-invoices-2026', range: 'Invoices!A:E' },
            },
          },
          {
            id: 'node_4',
            type: 'integration',
            position: { x: 250, y: 460 },
            data: {
              label: 'Slack Finance Alert',
              description: 'Posts invoice confirmation to #finance-approvals',
              service: 'slack',
              action: 'post_message',
              config: { channel: '#finance-approvals', text: 'New invoice processed: ${{node_2.total_amount}} from {{node_2.vendor_name}}' },
            },
          },
        ],
        edges: [
          { id: 'e_1_2', source: 'node_1', target: 'node_2', animated: true },
          { id: 'e_2_3', source: 'node_2', target: 'node_3', animated: true },
          { id: 'e_3_4', source: 'node_3', target: 'node_4', animated: true },
        ],
      };
    }

    // Pattern 2: Support ticket / Triage / Sentiment / Discord / Email
    if (p.includes('support') || p.includes('ticket') || p.includes('customer') || p.includes('triage') || p.includes('sentiment')) {
      return {
        name: 'Customer Support Triage & Auto-Responder',
        description: 'Ingests customer support requests, analyzes sentiment and urgency with AI, sends Gmail response, and notifies Discord on high priority.',
        tags: ['Customer Support', 'AI Triage', 'Gmail', 'Discord'],
        triggerConfig: { type: 'event', eventSource: 'gmail_incoming' },
        nodes: [
          {
            id: 'node_1',
            type: 'trigger',
            position: { x: 250, y: 40 },
            data: {
              label: 'Incoming Support Request',
              description: 'Triggered when a new email arrives',
              service: 'gmail',
              action: 'read_emails',
              config: { query: 'label:support is:unread' },
            },
          },
          {
            id: 'node_2',
            type: 'agent',
            position: { x: 250, y: 180 },
            data: {
              label: 'AI Sentiment & Triage Agent',
              description: 'Classifies urgency (P1/P2/P3) and detects sentiment',
              service: 'openai',
              action: 'analyze_sentiment',
              config: { prompt: 'Analyze urgency and draft empathetic resolution.' },
            },
          },
          {
            id: 'node_3',
            type: 'integration',
            position: { x: 250, y: 320 },
            data: {
              label: 'Gmail Auto-Reply',
              description: 'Sends automated acknowledgement with estimated SLA',
              service: 'gmail',
              action: 'send_email',
              config: { to: '{{node_1.from}}', subject: 'Re: Your Support Request', body: 'We have received your ticket and an engineer is reviewing it.' },
            },
          },
          {
            id: 'node_4',
            type: 'integration',
            position: { x: 250, y: 460 },
            data: {
              label: 'Discord Escalation Bot',
              description: 'Broadcasts urgent ticket warning to dev ops Discord channel',
              service: 'discord',
              action: 'post_message',
              config: { channel: '#support-alerts', text: 'Urgent Support Escalation: Ticket received with Priority P1' },
            },
          },
        ],
        edges: [
          { id: 'e_1_2', source: 'node_1', target: 'node_2', animated: true },
          { id: 'e_2_3', source: 'node_2', target: 'node_3', animated: true },
          { id: 'e_3_4', source: 'node_3', target: 'node_4', animated: true },
        ],
      };
    }

    // Pattern 3: Email / Gmail automation
    if (p.includes('email') || p.includes('gmail') || p.includes('newsletter') || p.includes('outreach')) {
      return {
        name: 'AI Email Assistant & Outreach Pipeline',
        description: 'Drafts personalized email sequences via AI and delivers them through Gmail with audit logging.',
        tags: ['Email', 'AI Drafter', 'Gmail', 'Google Sheets'],
        triggerConfig: { type: 'manual' },
        nodes: [
          {
            id: 'node_1',
            type: 'trigger',
            position: { x: 250, y: 40 },
            data: {
              label: 'Manual Execution Trigger',
              description: 'Triggered by operator console',
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
              label: 'AI Content Drafter',
              description: 'Drafts personalized executive update',
              service: 'gemini',
              action: 'summarize',
              config: { tone: 'professional', focus: 'weekly highlights' },
            },
          },
          {
            id: 'node_3',
            type: 'integration',
            position: { x: 250, y: 320 },
            data: {
              label: 'Gmail Dispatcher',
              description: 'Sends email to stakeholders',
              service: 'gmail',
              action: 'send_email',
              config: { to: 'team-leads@company.com', subject: 'Executive Operations Briefing' },
            },
          },
        ],
        edges: [
          { id: 'e_1_2', source: 'node_1', target: 'node_2', animated: true },
          { id: 'e_2_3', source: 'node_2', target: 'node_3', animated: true },
        ],
      };
    }

    // Default universal automation template
    return {
      name: `Automation: ${prompt.slice(0, 40)}`,
      description: `Automated operations pipeline designed for: "${prompt}"`,
      tags: ['Automation', 'AI Agent', 'Multi-Step', 'Operations'],
      triggerConfig: { type: 'manual' },
      nodes: [
        {
          id: 'node_1',
          type: 'trigger',
          position: { x: 250, y: 40 },
          data: {
            label: 'Operations Trigger',
            description: 'Initiates automation workflow',
            service: 'custom',
            action: 'manual',
            config: { prompt },
          },
        },
        {
          id: 'node_2',
          type: 'agent',
          position: { x: 250, y: 180 },
          data: {
            label: 'AI Orchestration Agent',
            description: 'Processes input prompt and structures payload',
            service: 'gemini',
            action: 'process_data',
            config: { instructions: prompt },
          },
        },
        {
          id: 'node_3',
          type: 'integration',
          position: { x: 250, y: 320 },
          data: {
            label: 'Slack Notification Dispatch',
            description: 'Broadcasts execution outcome to operations channel',
            service: 'slack',
            action: 'post_message',
            config: { channel: '#operations-feed', text: `Automation executed for prompt: "${prompt}"` },
          },
        },
        {
          id: 'node_4',
          type: 'integration',
          position: { x: 250, y: 460 },
          data: {
            label: 'Google Sheets Audit Record',
            description: 'Records run parameters and outputs to spreadsheet',
            service: 'google-sheets',
            action: 'append_row',
            config: { spreadsheetId: 'ops-audit-log', range: 'Sheet1!A:D' },
          },
        },
      ],
      edges: [
        { id: 'e_1_2', source: 'node_1', target: 'node_2', animated: true },
        { id: 'e_2_3', source: 'node_2', target: 'node_3', animated: true },
        { id: 'e_3_4', source: 'node_3', target: 'node_4', animated: true },
      ],
    };
  }

  /**
   * Validate and sanitize the workflow structure
   */
  sanitizeWorkflow(workflow, prompt, engineName) {
    const nodes = Array.isArray(workflow.nodes) ? workflow.nodes : [];
    const edges = Array.isArray(workflow.edges) ? workflow.edges : [];

    // Ensure positions and required fields
    const sanitizedNodes = nodes.map((node, index) => ({
      id: node.id || `node_${index + 1}`,
      type: node.type || (index === 0 ? 'trigger' : 'action'),
      position: node.position || { x: 250, y: 40 + index * 140 },
      data: {
        label: node.data?.label || `Step ${index + 1}`,
        description: node.data?.description || '',
        service: node.data?.service || 'custom',
        action: node.data?.action || 'custom',
        config: node.data?.config || {},
      },
    }));

    const sanitizedEdges = edges.map((edge, index) => ({
      id: edge.id || `edge_${edge.source}_${edge.target}_${index}`,
      source: edge.source,
      target: edge.target,
      animated: edge.animated !== undefined ? edge.animated : true,
      label: edge.label || '',
    }));

    return {
      name: workflow.name || `Automation Workflow`,
      description: workflow.description || `Generated workflow for prompt: ${prompt}`,
      triggerConfig: workflow.triggerConfig || { type: 'manual' },
      tags: Array.isArray(workflow.tags) ? workflow.tags : ['AI-Generated', 'Agentflow'],
      nodes: sanitizedNodes,
      edges: sanitizedEdges,
      version: 1,
      engine: engineName,
    };
  }
}

module.exports = new AIService();
