export const errorHandler = (err, req, res, next) => {
  // Handle duplicate key error (e.g. SKU collision)
  if (err.code === 11000) {
    const duplicateField = Object.keys(err.keyPattern || {})[0] || 'sku';
    return res.status(409).json({
      message: `A product with this ${duplicateField} already exists`,
      errors: [
        {
          field: duplicateField,
          message: `The ${duplicateField} must be globally unique`,
        },
      ],
    });
  }

  // Handle Mongoose cast errors (invalid ObjectId or types)
  if (err.name === 'CastError') {
    return res.status(400).json({
      message: `Invalid value for parameter: ${err.path}`,
      errors: [{ field: err.path, message: `Expected valid ${err.kind}` }],
    });
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({
      message: 'Database validation failed',
      errors,
    });
  }

  // Custom HTTP status errors
  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  const message = err.message || 'Internal server error';

  return res.status(statusCode).json({
    message,
    status: statusCode,
  });
};
