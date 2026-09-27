import { config } from '../config/index.js';

export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `The endpoint ${req.method} ${req.originalUrl} does not exist.`,
    },
  });
}

export function globalErrorHandler(err, req, res, next) {
  const isDev = config.isDev;

  console.error(`❌ [${new Date().toISOString()}] Error on ${req.method} ${req.originalUrl}:`, err);

  // Handle Multer upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: { code: 'FILE_TOO_LARGE', message: 'File size exceeds maximum allowed limit (5MB).' },
    });
  }

  if (err.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_FILE_TYPE', message: err.message },
    });
  }

  // Handle MySQL duplicate key error (ER_DUP_ENTRY)
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      error: { code: 'DUPLICATE_ENTRY', message: 'A record with this unique value already exists.' },
    });
  }

  // Handle MySQL foreign key constraint failure
  if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(400).json({
      success: false,
      error: { code: 'FOREIGN_KEY_VIOLATION', message: 'Referenced entity not found or cannot be removed.' },
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected internal error occurred on the server.',
      ...(isDev ? { stack: err.stack } : {}),
    },
  });
}
