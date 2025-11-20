import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

dotenv.config();

// Obtener la ruta del archivo actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ruta al archivo de credenciales de Firebase
// El archivo está en la carpeta config/ en la raíz del proyecto
const firebaseServiceAccountPath = join(__dirname, '../../config/firebase-service-account.json');

// Leer el archivo JSON de la cuenta de servicio
let firebaseConfig;
try {
  const serviceAccount = JSON.parse(readFileSync(firebaseServiceAccountPath, 'utf8'));
  firebaseConfig = serviceAccount;
} catch (error) {
  console.error('❌ Error al leer el archivo de credenciales de Firebase:', error.message);
  console.error('📁 Ruta esperada:', firebaseServiceAccountPath);
  throw new Error('No se pudo cargar el archivo de credenciales de Firebase');
}

// Inicializar Firebase Admin
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig),
    });
    console.log('✅ Firebase Admin inicializado correctamente');
    console.log(`📦 Proyecto: ${firebaseConfig.project_id}`);
  } catch (error) {
    console.error('❌ Error al inicializar Firebase Admin:', error);
    throw error;
  }
}

// Obtener instancias de Firestore y Auth
export const db = admin.firestore();
export const auth = admin.auth();

// Configurar configuración de Firestore
db.settings({ ignoreUndefinedProperties: true });

export default admin;

