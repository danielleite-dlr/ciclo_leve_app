import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ciclo Leve API',
      version: '1.0.0',
      description: 'API RESTful para App de Controle Hormonal Feminino',
      contact: {
        name: 'Suporte Ciclo Leve',
      },
    },
    servers: [
      {
        url: '/api/v1',
        description: 'Servidor Principal (v1)',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            nomeCompleto: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['USER', 'ADMIN', 'SPECIALIST'] },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
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
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);
