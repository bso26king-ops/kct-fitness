/**
 * Middleware factory for Zod validation
 * @param {object} schema - Zod schema
 * @param {string} source - Request source: 'body' | 'query' | 'params'
 * @returns {function} - Express middleware
 */
function validate(schema, source = 'body') {
  return (req, res, next) => {
    try {
      const data = req[source];
      const validated = schema.parse(data);
      req[source] = validated;
      next();
    } catch (error) {
      if (error.errors) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      return res.status(400).json({ error: 'Validation failed' });
    }
  };
}

module.exports = { validate };
