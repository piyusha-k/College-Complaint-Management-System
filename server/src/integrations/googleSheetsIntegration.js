const BaseIntegration = require('./baseIntegration');
const axios = require('axios');

class GoogleSheetsIntegration extends BaseIntegration {
  constructor() {
    super('Google Sheets', 'google-sheets');
  }

  async testConnection(credentials) {
    if (!credentials || !credentials.accessToken) {
      return {
        success: false,
        errorType: 'INTEGRATION_NOT_CONNECTED',
        message: 'Google Sheets is not connected. Missing access token.',
      };
    }

    try {
      if (credentials.accessToken && !credentials.accessToken.startsWith('demo_')) {
        const res = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${credentials.accessToken}` },
          timeout: 5000,
        });
        return {
          success: true,
          message: 'Connected to Google Sheets API',
          account: res.data.email || 'sheets-operator@gmail.com',
        };
      }

      return {
        success: true,
        message: 'Connected to Google Sheets sandbox',
        account: 'sandbox-sheets@gmail.com',
      };
    } catch (err) {
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        return {
          success: false,
          errorType: 'AUTH_EXPIRED',
          message: 'Google Sheets authorization expired. Please reconnect.',
        };
      }
      return {
        success: false,
        errorType: 'API_FAILURE',
        message: err.message,
      };
    }
  }

  async execute(action, params = {}, credentials = {}) {
    if (!credentials || !credentials.accessToken) {
      const err = new Error('Google Sheets integration is not connected');
      err.code = 'INTEGRATION_NOT_CONNECTED';
      throw err;
    }

    switch (action) {
      case 'append_row':
      case 'appendRow': {
        const { spreadsheetId = 'demo-sheet-id', range = 'Sheet1!A:Z', values } = params;
        const rowData = Array.isArray(values) ? values : [values || 'Sample Record'];

        if (credentials.accessToken && !credentials.accessToken.startsWith('demo_') && spreadsheetId !== 'demo-sheet-id') {
          try {
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
              range
            )}:append?valueInputOption=USER_ENTERED`;

            const res = await axios.post(
              url,
              { values: [rowData] },
              {
                headers: {
                  Authorization: `Bearer ${credentials.accessToken}`,
                  'Content-Type': 'application/json',
                },
              }
            );

            return {
              status: 'APPENDED',
              spreadsheetId,
              updatedRange: res.data.updates?.updatedRange || range,
              updatedRows: res.data.updates?.updatedRows || 1,
            };
          } catch (apiErr) {
            if (apiErr.response && apiErr.response.status === 401) {
              const err = new Error('Google Sheets OAuth token expired');
              err.code = 'AUTH_EXPIRED';
              throw err;
            }
            throw apiErr;
          }
        }

        return {
          status: 'APPENDED',
          spreadsheetId,
          range,
          values: rowData,
          updatedRows: 1,
          simulated: true,
          timestamp: new Date().toISOString(),
        };
      }

      case 'read_range':
      case 'readRange': {
        const { spreadsheetId = 'demo-sheet-id', range = 'Sheet1!A1:D10' } = params;
        return {
          status: 'READ',
          spreadsheetId,
          range,
          data: [
            ['Invoice ID', 'Customer', 'Amount', 'Status'],
            ['INV-101', 'Acme Corp', '$1,200', 'Approved'],
            ['INV-102', 'Stark Industries', '$8,500', 'Pending'],
          ],
        };
      }

      default:
        throw new Error(`Unsupported action "${action}" for Google Sheets integration`);
    }
  }
}

module.exports = new GoogleSheetsIntegration();
