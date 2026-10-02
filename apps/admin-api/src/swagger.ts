import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Admin API - PCIARS',
      version: '1.0.0',
      description: 'API administrativa da PCIARS do NIAR-Saúde',
    },
    servers: [
      {
        url: '/api',
        description: 'Mesmo host da aplicação (local ou publicado)',
      }
    ],
    components: {
      schemas: {
        // Cadastro público (rota POST /admin/users)
        CreateUser: {
          type: 'object',
          required: ['full_name', 'email', 'password'],
          properties: {
            full_name: { type: 'string', example: 'Pesquisador Teste' },
            email: { type: 'string', format: 'email', example: 'teste@niar.local' },
            password: { type: 'string', format: 'password', minLength: 8, example: 'senha12345' },
          },
        },
        CreateUserByAdmin: {
          type: 'object',
          required: ['full_name', 'email', 'password', 'role'],
          properties: {
            full_name: { type: 'string', example: 'Usuário Teste' },
            email: { type: 'string', format: 'email', example: 'usuario@niar.local' },
            password: { type: 'string', format: 'password', minLength: 8, example: 'senha12345' },
            role: { type: 'string', enum: ['researcher', 'admin', 'committee'] },
          },
        },
        CreateResearcher: {
          type: 'object',
          required: ['full_name', 'email', 'password', 'coep'],
          properties: {
            full_name: { type: 'string', example: 'Pesquisador Um' },
            email: { type: 'string', format: 'email', example: 'pesquisador@niar.local' },
            password: { type: 'string', format: 'password', minLength: 8, example: 'senha12345' },
            profile: {
              type: 'object',
              properties: {
                phone: { type: 'string', example: '+55 31 99999-0000' },
                institution: { type: 'string', example: 'UFMG' },
                organizational_unit: { type: 'string', example: 'DCC' },
                contact_address: { type: 'string', example: 'Av. Pres. Antônio Carlos, 6627' },
              },
            },
            researcher_profile: {
              type: 'object',
              properties: {
                research_area: { type: 'string', example: 'Oncologia computacional' },
                position: { type: 'string', example: 'Professor adjunto' },
              },
            },
            coep: {
              type: 'object',
              required: ['caae', 'opinion_number', 'approval_date', 'document_filename', 'document_storage_path'],
              properties: {
                caae: { type: 'string', example: '12345678.9.0000.0000' },
                opinion_number: { type: 'string', example: '4.567.890' },
                approval_date: { type: 'string', format: 'date', example: '2026-01-15' },
                document_filename: { type: 'string', example: 'parecer.pdf' },
                document_storage_path: { type: 'string', example: '/exports/coep/parecer.pdf' },
              },
            },
          },
        },
        CreateCommitteeMember: {
          type: 'object',
          required: ['full_name', 'email', 'password', 'specialty_id'],
          properties: {
            full_name: { type: 'string', example: 'Membro do Comitê' },
            email: { type: 'string', format: 'email', example: 'comite@niar.local' },
            password: { type: 'string', format: 'password', minLength: 8, example: 'senha-segura' },
            specialty_id: { type: 'integer', example: 2 },
          },
        },
        CreateAdministrator: {
          type: 'object',
          required: ['full_name', 'email', 'password'],
          properties: {
            full_name: { type: 'string', example: 'Administrador' },
            email: { type: 'string', format: 'email', example: 'admin@niar.local' },
            password: { type: 'string', format: 'password', minLength: 8, example: 'senha-segura' },
          },
        },
        UserResponse: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            full_name: { type: 'string', example: 'Pesquisador Teste' },
            email: { type: 'string', example: 'teste@niar.local' },
            role: { type: 'string', enum: ['researcher', 'admin', 'committee'] },
            is_active: { type: 'boolean', example: true },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  path: { type: 'array', items: { type: 'string' } },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
      },
    }
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
