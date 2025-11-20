import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Water Consumption API',
      version: '1.0.0',
      description: 'API para sistema de gestión de consumo de agua',
      contact: {
        name: 'Soporte API',
        email: 'support@example.com',
      },
      license: {
        name: 'ISC',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo',
      },
      {
        url: 'https://api.example.com',
        description: 'Servidor de producción',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Ingresa el token JWT obtenido al iniciar sesión',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              description: 'ID único del usuario',
            },
            name: {
              type: 'string',
              description: 'Nombre completo del usuario',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Correo electrónico del usuario',
            },
            nickname: {
              type: 'string',
              nullable: true,
              description: 'Apodo del usuario',
            },
            avatarUrl: {
              type: 'string',
              nullable: true,
              description: 'URL del avatar del usuario',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación',
            },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 255,
              example: 'Juan Pérez',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'juan@example.com',
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'Debe contener al menos una mayúscula, una minúscula y un número',
              example: 'Password123',
            },
          },
          description: 'El nickname se compra en la tienda, no se define en el registro',
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'juan@example.com',
            },
            password: {
              type: 'string',
              example: 'Password123',
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Usuario registrado exitosamente',
            },
            data: {
              type: 'object',
              properties: {
                user: {
                  $ref: '#/components/schemas/User',
                },
                token: {
                  type: 'string',
                  description: 'Token JWT para autenticación',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                },
              },
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Mensaje de error',
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                  },
                  message: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/server.js'], // Rutas donde buscar documentación
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerSpec, swaggerUi };

