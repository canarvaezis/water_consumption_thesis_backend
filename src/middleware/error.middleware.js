/**
 * Middleware para manejo de errores de validación
 */
export const validationErrorHandler = (req, res, next) => {
  const errors = req.validationErrors || [];
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors.map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value,
      })),
    });
  }
  
  next();
};

/**
 * Wrapper para manejar errores asíncronos
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

