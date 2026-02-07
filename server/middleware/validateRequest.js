const validateRequest = (schema) => (req, res, next) => {
  try {
    const parsed = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!parsed.success) {
      const errors = parsed.error.errors.map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
    });
  }
};

module.exports = { validateRequest };
