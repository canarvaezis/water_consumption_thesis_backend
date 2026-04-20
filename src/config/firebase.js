import admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import logger from '../utils/logger.js';

// Obtener la ruta del archivo actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ruta al archivo de credenciales: en Docker/EC2 suele inyectarse con FIREBASE_KEY_PATH
const firebaseServiceAccountPath =
  process.env.FIREBASE_KEY_PATH ||
  join(__dirname, '../../config/firebase-service-account.json');

// Leer el archivo JSON de la cuenta de servicio
let firebaseConfig;
try {
  const serviceAccount = JSON.parse(readFileSync(firebaseServiceAccountPath, 'utf8'));
  firebaseConfig = serviceAccount;
} catch (error) {
  logger.error('Error al leer el archivo de credenciales de Firebase', {
    error: error.message,
    path: firebaseServiceAccountPath,
  });
  throw new Error('No se pudo cargar el archivo de credenciales de Firebase');
}

// Inicializar Firebase Admin
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig),
    });
    logger.info('Firebase Admin inicializado correctamente', {
      projectId: firebaseConfig.project_id,
    });
  } catch (error) {
    logger.error('Error al inicializar Firebase Admin', {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

// Obtener instancias de Firestore y Auth
export const db = admin.firestore();
export const auth = admin.auth();

// Configurar configuración de Firestore
db.settings({ ignoreUndefinedProperties: true });

export default admin;

