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
        CreateUser: {
          type: 'object',
          description:
            'Cadastro público de pesquisador. A role enviada pelo cliente é ignorada: sempre cria "researcher".',
          required: ['full_name', 'email', 'password', 'profile', 'researcher_profile', 'coep', 'coep_document'],
          properties: {
            full_name: { type: 'string', example: 'Pesquisador Teste' },
            email: { type: 'string', format: 'email', example: 'pesquisador@exemplo.com' },
            password: { type: 'string', format: 'password', minLength: 8, example: 'senha-segura' },
            profile: {
              type: 'string',
              description: 'JSON com phone, institution, organizational_unit e contact_address.',
              example: '{"phone":"(31) 99999-9999","institution":"UFMG","organizational_unit":"Faculdade de Medicina","contact_address":"Belo Horizonte - MG"}',
            },
            researcher_profile: {
              type: 'string',
              description: 'JSON com research_area e position.',
              example: '{"research_area":"Saúde pública","position":"Professor"}',
            },
            coep: {
              type: 'string',
              description: 'JSON com caae, opinion_number e approval_date no formato YYYY-MM-DD. O nome do arquivo vem de coep_document.',
              example: '{"caae":"12345678.9.0000.0000","opinion_number":"1234.567","approval_date":"2026-09-25"}',
            },
            coep_document: { type: 'string', format: 'binary', description: 'Parecer do COEP em PDF, até 10 MB.' },
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
        PublicUserCreatedResponse: {
          allOf: [
            { $ref: '#/components/schemas/UserResponse' },
            {
              type: 'object',
              description: 'Não inclui password, hashed_password nem document_storage_path.',
              properties: {
                profile: {
                  type: 'object',
                  properties: {
                    phone: { type: 'string', example: '(31) 99999-9999' },
                    institution: { type: 'string', example: 'UFMG' },
                    organizational_unit: { type: 'string', example: 'Faculdade de Medicina' },
                    contact_address: { type: 'string', example: 'Belo Horizonte - MG' },
                  },
                },
                researcher_profile: {
                  type: 'object',
                  properties: {
                    research_area: { type: 'string', example: 'Saúde pública' },
                    position: { type: 'string', example: 'Professor' },
                  },
                },
                coep: {
                  type: 'object',
                  properties: {
                    caae: { type: 'string', example: '12345678.9.0000.0000' },
                    opinion_number: { type: 'string', example: '1234.567' },
                    approval_date: { type: 'string', format: 'date', example: '2026-09-25' },
                    document_filename: { type: 'string', example: 'parecer-coep.pdf' },
                  },
                },
              },
            },
          ],
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
