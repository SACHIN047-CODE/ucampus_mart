/**
 * Zod validation middleware for Express
 * Validates req.body, req.query, or req.params against schemas
 */
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (error) {
      if (error.errors) {
        const details = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details,
          },
        });
      }
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: error.message },
      });
    }
  };
}
