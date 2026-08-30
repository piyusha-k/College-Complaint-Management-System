const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        errors: errors.array().map((e) => ({
          field: e.path || e.param,
          message: e.msg,
          value: e.value,
        })),
      },
    });
  }
  next();
};

module.exports = validate;
