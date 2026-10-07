function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error.name === 'ValidationError') {
    const details = Object.values(error.errors || {}).map((item) => ({
      field: item.path,
      message: item.kind === 'required' ? 'is required' : `is invalid (${item.kind})`,
    }));
    return res.status(400).json({ error: 'Validation failed', details });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: [{ field: error.path || 'id', message: 'has an invalid value' }],
    });
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || 'value';
    return res.status(400).json({
      error: 'Validation failed',
      details: [{ field, message: 'already exists' }],
    });
  }

  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ error: 'Invalid JSON request body.' });
  }

  const status = Number.isInteger(error.statusCode) ? error.statusCode : 500;
  const message = status >= 500 ? 'Internal server error.' : error.message;
  const response = { error: message };
  if (status < 500 && Array.isArray(error.details)) response.details = error.details;
  return res.status(status).json(response);
}

module.exports = errorHandler;
