const mongoose = require('mongoose');

const integrationSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    provider: {
      type: String,
      enum: ['gmail', 'slack', 'google-sheets', 'discord', 'openrouter', 'gemini'],
      required: true,
    },
    isConnected: {
      type: Boolean,
      default: false,
    },
    displayName: {
      type: String,
      default: '',
    },
    accountEmail: {
      type: String,
      default: '',
    },
    scopes: {
      type: [String],
      default: [],
    },
    encryptedTokens: {
      iv: { type: String, default: '' },
      data: { type: String, default: '' },
      authTag: { type: String, default: '' },
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    lastTestedAt: {
      type: Date,
      default: null,
    },
    statusMessage: {
      type: String,
      default: 'Not configured',
    },
  },
  { timestamps: true }
);

integrationSchema.index({ owner: 1, provider: 1 }, { unique: true });

module.exports = mongoose.model('Integration', integrationSchema);
