import swaggerJSDoc from 'swagger-jsdoc'

const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Punto Plebes',
      version: '1.0.0',
      description: 'API documentation for punto plebes'
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local server'
      }
    ],
    tags: [
      {
        name: 'Auth',
        description: 'Endpoints related to authentication'
      },
      {
        name: 'Categories',
        description: 'Endpoints for managing categories'
      },
      {
        name: 'Meals',
        description: 'Endpoints for managing meals'
      },
      {
        name: 'Orders',
        description: 'Endpoints for managing orders'
      },
      {
        name: 'Claves',
        description: 'Endpoints for managing claves'
      },
      {
        name: 'Modifiers',
        description: 'Endpoints for managing modifiers'
      },
      {
        name: 'Users',
        description: 'Endpoints for managing users'
      }
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
          description: 'API key required for authentication'
        },
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token required for authentication'
        }
      }
    }
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts']
}

const swaggerSpec = swaggerJSDoc(swaggerOptions)

export default swaggerSpec
