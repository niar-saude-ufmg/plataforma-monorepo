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
          description:
            'Cadastro público de pesquisador. A role enviada pelo cliente é ignorada: sempre cria "researcher" com status "pending".',
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
        CreateResearcher: {
          type: 'object',
          description:
            'Cadastro administrativo de pesquisador. Usa o mesmo contrato multipart do cadastro público, mas cria a conta ativa e registra a aprovação inicial pelo admin autenticado.',
          required: ['full_name', 'email', 'password', 'profile', 'researcher_profile', 'coep', 'coep_document'],
          properties: {
            full_name: { type: 'string', example: 'Pesquisador Um' },
            email: { type: 'string', format: 'email', example: 'pesquisador@niar.local' },
            password: { type: 'string', format: 'password', minLength: 8, example: 'senha12345' },
            profile: {
              type: 'string',
              description: 'JSON com phone, institution, organizational_unit e contact_address.',
              example: '{"phone":"+55 31 99999-0000","institution":"UFMG","organizational_unit":"DCC","contact_address":"Av. Pres. Antônio Carlos, 6627"}',
            },
            researcher_profile: {
              type: 'string',
              description: 'JSON com research_area e position.',
              example: '{"research_area":"Oncologia computacional","position":"Professor adjunto"}',
            },
            coep: {
              type: 'string',
              description: 'JSON com caae, opinion_number e approval_date no formato YYYY-MM-DD. O nome do arquivo vem de coep_document.',
              example: '{"caae":"12345678.9.0000.0000","opinion_number":"4.567.890","approval_date":"2026-01-15"}',
            },
            coep_document: { type: 'string', format: 'binary', description: 'Parecer do COEP em PDF, até 10 MB.' },
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
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        UserAuthEvaluationResponse: {
          type: 'object',
          required: [
            'id',
            'user_id',
            'status',
            'justification',
            'evaluated_by_user_id',
            'evaluated_at',
            'created_at',
            'user_coep_data_id',
          ],
          properties: {
            id: { type: 'integer', example: 12 },
            user_id: { type: 'integer', example: 42 },
            status: {
              type: 'string',
              enum: ['pending', 'active', 'rejected', 'disabled'],
              example: 'active',
            },
            justification: { type: 'string', nullable: true, example: 'Cadastro aprovado.' },
            evaluated_by_user_id: { type: 'integer', example: 7 },
            evaluated_at: { type: 'string', format: 'date-time' },
            created_at: { type: 'string', format: 'date-time' },
            user_coep_data_id: { type: 'integer', nullable: true, example: 4 },
          },
        },
        AuthenticatedUserResponse: {
          type: 'object',
          required: ['id', 'full_name', 'email', 'role', 'account_status'],
          properties: {
            id: { type: 'integer', example: 1 },
            full_name: { type: 'string', example: 'Pesquisador Teste' },
            email: { type: 'string', format: 'email', example: 'teste@niar.local' },
            role: { type: 'string', enum: ['researcher', 'admin', 'committee'] },
            account_status: { type: 'string', enum: ['pending', 'active', 'rejected', 'disabled'], example: 'active' },
            profile: {
              type: 'object',
              description: 'Presente para pesquisadores quando houver perfil cadastrado.',
              properties: {
                phone: { type: 'string', nullable: true, example: '(31) 99999-9999' },
                institution: { type: 'string', nullable: true, example: 'UFMG' },
                organizational_unit: { type: 'string', nullable: true, example: 'DCC' },
                contact_address: { type: 'string', nullable: true, example: 'Belo Horizonte - MG' },
              },
            },
            researcher_profile: {
              type: 'object',
              description: 'Presente para pesquisadores quando houver perfil cadastrado.',
              properties: {
                research_area: { type: 'string', nullable: true, example: 'Saúde pública' },
                position: { type: 'string', nullable: true, example: 'Professor' },
              },
            },
            coep: {
              type: 'object',
              description: 'Metadados do parecer mais recente. O arquivo é obtido pelo endpoint de download.',
              properties: {
                caae: { type: 'string', example: '12345678.9.0000.0000' },
                opinion_number: { type: 'string', example: '1234.567' },
                approval_date: { type: 'string', format: 'date', example: '2026-09-25' },
                document_filename: { type: 'string', example: 'parecer-coep.pdf' },
              },
            },
            committee_profile: {
              type: 'object',
              description: 'Presente para membros do comitê.',
              properties: {
                specialty: {
                  type: 'object',
                  properties: {
                    id: { type: 'integer', example: 1 },
                    code: { type: 'string', example: 'CC' },
                    name: { type: 'string', example: 'Ciência da Computação' },
                    description: { type: 'string', example: '...' },
                    guidance_context: { type: 'string', example: 'Responsável por...' },
                    is_active: { type: 'boolean', example: true },
                  },
                },
              },
            },
          },
        },
        UpdateMe: {
          type: 'object',
          description:
            'Edição do próprio perfil. Todos os campos são opcionais, mas ao menos um entre full_name, email, phone e password deve ser enviado. O telefone só pode ser alterado por pesquisadores. Campos fora desta lista são recusados com 400.',
          properties: {
            full_name: { type: 'string', example: 'Novo Nome Completo' },
            email: { type: 'string', format: 'email', example: 'novo.email@niar.local' },
            phone: {
              type: 'string',
              maxLength: 50,
              description: 'Pode ser alterado por pesquisadores.',
              example: '(31) 99999-9999',
            },
            current_password: {
              type: 'string',
              format: 'password',
              description: 'Obrigatório quando password é enviado.',
              example: 'senha-atual',
            },
            password: {
              type: 'string',
              format: 'password',
              minLength: 8,
              example: 'nova-senha-segura',
            },
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
        ProjectStatusResponse: {
          type: 'object',
          required: ['code', 'label', 'version_number', 'created_at', 'notes'],
          properties: {
            code: {
              type: 'string',
              enum: ['submitted_to_committee', 'resubmitted_to_committee', 'under_review', 'needs_changes', 'approved', 'rejected'],
            },
            label: { type: 'string', example: 'Em avaliação' },
            version_number: { type: 'integer', example: 1 },
            created_at: { type: 'string', format: 'date-time' },
            notes: { type: 'string', nullable: true },
          },
        },
        ProjectDocumentResponse: {
          type: 'object',
          required: ['id', 'version_number', 'document_type', 'original_filename', 'created_at', 'download_url'],
          properties: {
            id: { type: 'integer', example: 101 },
            version_number: { type: 'integer', example: 1 },
            document_type: { type: 'string', example: 'project_docx' },
            original_filename: { type: 'string', example: 'projeto-v1.docx' },
            created_at: { type: 'string', format: 'date-time' },
            download_url: { type: 'string', example: '/api/admin/projects/42/documents/101/download' },
          },
        },
        ProjectResponse: {
          type: 'object',
          required: ['id', 'title', 'updated_at', 'researcher', 'status', 'documents'],
          properties: {
            id: { type: 'integer', example: 42 },
            title: { type: 'string', example: 'Projeto de pesquisa' },
            updated_at: { type: 'string', format: 'date-time' },
            evaluation_status: { type: 'string', enum: ['waiting', 'to_review', 'approved', 'needs_changes', 'rejected'], example: 'waiting' },
            researcher: {
              type: 'object',
              required: ['id', 'full_name', 'email'],
              properties: {
                id: { type: 'integer', example: 10 },
                full_name: { type: 'string', example: 'Pesquisador 10' },
                email: { type: 'string', format: 'email', example: 'researcher@niar.local' },
              },
            },
            status: {
              type: 'array',
              items: { $ref: '#/components/schemas/ProjectStatusResponse' },
            },
            documents: {
              type: 'array',
              items: { $ref: '#/components/schemas/ProjectDocumentResponse' },
            },
            evaluations: {
              type: 'array',
              items: { $ref: '#/components/schemas/ProjectEvaluationResponse' },
            },
          },
        },
        ProjectEvaluationResponse: {
          type: 'object',
          required: ['id', 'version_number', 'result', 'responsible_member', 'evaluated_at', 'updated_at'],
          properties: {
            id: { type: 'integer', example: 8 },
            version_number: { type: 'integer', example: 2 },
            result: { type: 'string', enum: ['to_review', 'approved', 'needs_changes', 'rejected'] },
            responsible_member: {
              type: 'object',
              required: ['user_id', 'full_name', 'email', 'specialty'],
              properties: {
                user_id: { type: 'integer', example: 4 },
                full_name: { type: 'string', example: 'Membro do comitê' },
                email: { type: 'string', format: 'email' },
                specialty: {
                  type: 'object',
                  required: ['id', 'name'],
                  properties: {
                    id: { type: 'integer', example: 2 },
                    name: { type: 'string', example: 'Epidemiologia' },
                  },
                },
              },
            },
            evaluated_at: { type: 'string', format: 'date-time', nullable: true },
            updated_at: { type: 'string', format: 'date-time' },
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
