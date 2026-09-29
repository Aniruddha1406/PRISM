function errorHandler(err, req, res, next) {
  console.error(`[${new Date().toISOString()}] Error:`, err.message);
  
  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed.',
        details: err.errors,
      }
    });
  }

  if (err.name === 'MulterError') {
    return res.status(400).json({
      error: {
        code: 'UPLOAD_ERROR',
        message: err.message,
      }
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: statusCode === 500 ? 'An internal error occurred.' : err.message,
    }
  });
}

module.exports = { errorHandler };
