const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

  const statusCode = err.statusCode || (err.code === 'AUTH_EXPIRED' || err.code === 'INTEGRATION_NOT_CONNECTED' ? 400 : 500);
  const errorCode = err.code || err.errorType || (statusCode === 404 ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR');

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: err.message || 'An unexpected error occurred',
      details: err.details || null,
      ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
    },
  });
};

module.exports = errorHandler;
