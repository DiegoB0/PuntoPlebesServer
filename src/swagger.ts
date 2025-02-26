import swaggerJSDoc from 'swagger-jsdoc'

const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Punto Plebes',
      version: '1.0.0',
      description: 'API documentation for punto plebes',
      servers: [
        {
          url: 'http://localhost:5000',
          description: 'local server'
        }
      ]
    }
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts']
}

const swaggerSpec = swaggerJSDoc(swaggerOptions)

export default swaggerSpec
