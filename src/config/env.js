/**
 * Validación de Variables de Entorno
 * 
 * Valida que todas las variables de entorno requeridas estén presentes
 * al iniciar la aplicación. Previene errores en runtime.
 * 
 * IMPORTANTE: Este archivo debe importarse ANTES que cualquier otro
 * que use variables de entorno, ya que valida y carga dotenv.
 */

import Joi from 'joi';
import dotenv from 'dotenv';

// Cargar variables de entorno PRIMERO
dotenv.config();

/**
 * Esquema de validación para variables de entorno
 */
const envSchema = Joi.object({
  // Entorno
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  
  // Puerto del servidor
  PORT: Joi.number()
    .port()
    .default(3000),
  
  // CORS - Puede ser un string o múltiples orígenes separados por coma
  CORS_ORIGIN: Joi.string()
    .default('*'),
  
  // Firebase (opcional en desarrollo si se usa emulador)
  FIREBASE_PROJECT_ID: Joi.string()
    .optional(),
  
  // Logging
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'http', 'debug')
    .optional(),
})
  .unknown() // Permitir otras variables no definidas (para flexibilidad)
  .required(); // Todas las variables definidas son requeridas (o tienen default)

/**
 * Validar variables de entorno
 */
const { error, value: envVars } = envSchema.validate(process.env, {
  abortEarly: false, // Mostrar todos los errores, no solo el primero
  stripUnknown: true, // Eliminar variables no definidas en el schema
});

if (error) {
  const errorDetails = error.details.map((detail) => detail.message).join(', ');
  throw new Error(
    `❌ Configuración de variables de entorno inválida:\n${errorDetails}\n\n` +
    `Por favor, revisa tu archivo .env y asegúrate de que todas las variables requeridas estén configuradas correctamente.`
  );
}

/**
 * Exportar variables de entorno validadas y tipadas
 */
export const env = {
  // Entorno
  nodeEnv: envVars.NODE_ENV,
  isDevelopment: envVars.NODE_ENV === 'development',
  isProduction: envVars.NODE_ENV === 'production',
  isTest: envVars.NODE_ENV === 'test',
  
  // Servidor
  port: envVars.PORT,
  corsOrigin: envVars.CORS_ORIGIN,
  
  // Firebase
  firebaseProjectId: envVars.FIREBASE_PROJECT_ID,
  
  // Logging
  logLevel: envVars.LOG_LEVEL,
};

// Log de confirmación (usando console porque logger aún no está inicializado)
// En producción, este log se mostrará antes de que el logger esté listo
if (env.isDevelopment) {
  console.log('✅ Variables de entorno validadas correctamente');
}

