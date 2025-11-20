import { body, validationResult } from 'express-validator';

/**
 * Middleware para validar resultados de validación
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value,
      })),
    });
  }
  next();
};

/**
 * Validaciones comunes
 */
export const validators = {
  email: body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),

  password: body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),

  name: body('name')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('El nombre debe tener entre 2 y 255 caracteres'),

  optionalString: (field, minLength = 0, maxLength = 255) =>
    body(field)
      .optional()
      .trim()
      .isLength({ min: minLength, max: maxLength })
      .withMessage(`${field} debe tener entre ${minLength} y ${maxLength} caracteres`),
};

