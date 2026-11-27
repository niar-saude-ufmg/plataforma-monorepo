import swaggerJsdoc from 'swagger-jsdoc';
import { projectEvaluationStatusSchema, projectStatusSchema } from './schemas/project-schema.js';
import { updateEvaluationSchema } from './schemas/evaluation-schema.js';
import { QUESTIONNAIRE_TEXT_TYPES, QUESTIONNAIRE_CHOICE_TYPES, QUESTIONNAIRE_INFORMATION_SEVERITIES } from '@niar/contracts';

const questionnaireQuestionProperties = {
  id: { type: 'string', pattern: '^[a-z][a-z0-9]*(?:[_-][a-z0-9]+)*$' },
  label: { type: 'string', minLength: 1, maxLength: 1000 },
  required: { type: 'boolean' },
  description: { type: 'string', maxLength: 2000 },
  information: { $ref: '#/components/schemas/QuestionnaireInformation' },
};

const questionnaireInputProperties = {
  key: { type: 'string', minLength: 1, maxLength: 100, pattern: '^[a-z][a-z0-9]*(?:[_-][a-z0-9]+)*$' },
  title: { type: 'string', minLength: 1, maxLength: 255 },
  sections: { type: 'array', minItems: 1, items: { $ref: '#/components/schemas/QuestionnaireSection' } },
};

const decisionProperties = {
  status: { type: 'string', enum: [...updateEvaluationSchema.innerType().shape.status.options] },
  evaluation_id: { type: 'integer', minimum: 1 },
  justification: { type: 'string' },
  certification_decision: { type: 'string', enum: ['granted', 'not_granted'] },
  certification_reason: { type: 'string' },
};

const decisionVariants = updateEvaluationSchema.innerType().shape.status.options.map((status) => {
  const isReport = status.startsWith('report_');
  const needsJustification = status.endsWith('rejected') || status.endsWith('changes_requested');
  const required = ['status', ...(isReport ? ['evaluation_id'] : []), ...(needsJustification ? ['justification'] : [])];
  const properties = {
    status: { type: 'string', enum: [status] },
    ...(needsJustification ? { justification: { type: 'string', pattern: '\\S' } } : {}),
  };
  if (status === 'report_approved') {
    return {
      required: [...required, 'certification_decision'], properties,
      oneOf: [
        { properties: { certification_decision: { enum: ['granted'] } } },
        { required: ['certification_reason'], properties: {
          certification_decision: { enum: ['not_granted'] }, certification_reason: { type: 'string', pattern: '\\S' },
        } },
      ],
    };
  }
  return { required, properties: {
    ...properties, certification_decision: { not: {} }, certification_reason: { type: 'string', pattern: '^\\s*$' },
  } };
});

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
            role: { type: 'string', enum: ['researcher', 'admin', 'committee', 'auditor'], description: 'auditor identifica somente contas históricas' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        UserProfileResponse: {
          type: 'object',
          required: ['phone', 'institution', 'organizational_unit', 'contact_address'],
          properties: {
            phone: { type: 'string', nullable: true, example: '(31) 99999-9999' },
            institution: { type: 'string', nullable: true, example: 'UFMG' },
            organizational_unit: { type: 'string', nullable: true, example: 'Faculdade de Medicina' },
            contact_address: { type: 'string', nullable: true, example: 'Belo Horizonte - MG' },
          },
        },
        ResearcherProfileResponse: {
          type: 'object',
          required: ['research_area', 'position'],
          properties: {
            research_area: { type: 'string', nullable: true, example: 'Saúde pública' },
            position: { type: 'string', nullable: true, example: 'Professor' },
          },
        },
        CoepResponse: {
          type: 'object',
          required: ['caae', 'opinion_number', 'approval_date', 'document_filename'],
          properties: {
            caae: { type: 'string', example: '12345678.9.0000.0000' },
            opinion_number: { type: 'string', example: '1234.567' },
            approval_date: { type: 'string', format: 'date', example: '2026-09-25' },
            document_filename: { type: 'string', example: 'parecer-coep.pdf' },
          },
        },
        CommitteeProfileResponse: {
          type: 'object',
          required: ['specialty'],
          properties: {
            specialty: {
              type: 'object',
              required: ['id', 'code', 'name'],
              properties: {
                id: { type: 'integer', example: 2 },
                code: { type: 'string', example: 'CC' },
                name: { type: 'string', example: 'Ciência da Computação' },
              },
            },
          },
        },
        ConsolidatedUserResponse: {
          type: 'object',
          description: 'Dados administrativos consolidados. Nunca inclui senha, token ou caminho interno do documento.',
          required: [
            'id',
            'email',
            'full_name',
            'role',
            'account_status',
            'created_at',
            'profile',
            'researcher_profile',
            'committee_profile',
            'coep',
            'latest_auth_evaluation',
          ],
          properties: {
            id: { type: 'integer', example: 10 },
            email: { type: 'string', format: 'email', example: 'pesquisador@exemplo.com' },
            full_name: { type: 'string', example: 'Pesquisador Teste' },
            role: { type: 'string', enum: ['researcher', 'admin', 'committee', 'auditor'], description: 'auditor identifica somente contas históricas' },
            account_status: {
              type: 'string',
              enum: ['pending', 'active', 'rejected', 'disabled'],
              example: 'pending',
            },
            created_at: { type: 'string', format: 'date-time' },
            profile: {
              nullable: true,
              allOf: [{ $ref: '#/components/schemas/UserProfileResponse' }],
            },
            researcher_profile: {
              nullable: true,
              allOf: [{ $ref: '#/components/schemas/ResearcherProfileResponse' }],
            },
            committee_profile: {
              nullable: true,
              allOf: [{ $ref: '#/components/schemas/CommitteeProfileResponse' }],
            },
            coep: {
              nullable: true,
              allOf: [{ $ref: '#/components/schemas/CoepResponse' }],
            },
            latest_auth_evaluation: {
              type: 'object',
              nullable: true,
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
                user_id: { type: 'integer', example: 10 },
                status: { type: 'string', enum: ['pending', 'active', 'rejected', 'disabled'] },
                justification: { type: 'string', nullable: true, example: 'Cadastro aprovado.' },
                evaluated_by_user_id: { type: 'integer', nullable: true, example: 7 },
                evaluated_at: { type: 'string', format: 'date-time', nullable: true },
                created_at: { type: 'string', format: 'date-time' },
                user_coep_data_id: { type: 'integer', nullable: true, example: 4 },
              },
            },
          },
        },
        PaginatedUsersResponse: {
          type: 'object',
          required: ['items', 'pagination'],
          properties: {
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/ConsolidatedUserResponse' },
            },
            pagination: {
              type: 'object',
              required: ['page', 'page_size', 'total_items', 'total_pages'],
              properties: {
                page: { type: 'integer', example: 1 },
                page_size: { type: 'integer', example: 20 },
                total_items: { type: 'integer', example: 42 },
                total_pages: { type: 'integer', example: 3 },
              },
            },
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
              description: 'Presente para pesquisadores quando houver perfil cadastrado.',
              allOf: [{ $ref: '#/components/schemas/UserProfileResponse' }],
            },
            researcher_profile: {
              description: 'Presente para pesquisadores quando houver perfil cadastrado.',
              allOf: [{ $ref: '#/components/schemas/ResearcherProfileResponse' }],
            },
            coep: {
              description: 'Metadados do parecer mais recente. O arquivo é obtido pelo endpoint de download.',
              allOf: [{ $ref: '#/components/schemas/CoepResponse' }],
            },
            committee_profile: {
              description: 'Presente para membros do comitê.',
              allOf: [{ $ref: '#/components/schemas/CommitteeProfileResponse' }],
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
                  $ref: '#/components/schemas/UserProfileResponse',
                },
                researcher_profile: {
                  $ref: '#/components/schemas/ResearcherProfileResponse',
                },
                coep: {
                  $ref: '#/components/schemas/CoepResponse',
                },
              },
            },
          ],
        },
        UpdateEvaluationInput: { type: 'object', properties: decisionProperties, oneOf: decisionVariants },
        ProjectEvaluationStatus: { type: 'string', enum: [...projectEvaluationStatusSchema.options] },
        EvaluationStatus: { type: 'string', enum: projectEvaluationStatusSchema.options.filter((status) => status !== 'waiting') },
        EvaluationResponse: {
          type: 'object',
          required: ['id', 'round_number', 'delivery_number', 'status', 'project_version'],
          properties: {
            id: { type: 'integer' },
            round_number: { type: 'integer', minimum: 1, description: 'Rodada imutável de atribuição, encaminhamento ou parecer' },
            delivery_number: { type: 'integer', minimum: 0, description: '0 identifica a submissão escrita; 1 ou mais identifica a entrega de relatório. Documentos da entrega estão no GET do projeto.' },
            committee_member_user_id: { type: 'integer', nullable: true },
            status: { $ref: '#/components/schemas/EvaluationStatus' },
            certification_decision: { type: 'string', nullable: true, enum: ['granted', 'not_granted'] },
            certification_reason: { type: 'string', nullable: true },
            justification: { type: 'string', nullable: true },
            project_version: {
              type: 'object',
              properties: {
                id: { type: 'integer' }, project_id: { type: 'integer' }, version_number: { type: 'integer' },
                status: { type: 'string' }, submitted_at: { type: 'string', format: 'date-time', nullable: true }, created_at: { type: 'string', format: 'date-time' }
              }
            },
            project: { type: 'object', properties: { id: { type: 'integer' }, owner_user_id: { type: 'integer' }, title: { type: 'string' } } },
            assigned_to: { type: 'object', nullable: true, additionalProperties: true },
            assigned_by: { type: 'object', nullable: true, additionalProperties: true },
            evaluated_by: { type: 'object', nullable: true, additionalProperties: true },
            evaluated_at: { type: 'string', format: 'date-time', nullable: true },
            created_at: { type: 'string', format: 'date-time' }, updated_at: { type: 'string', format: 'date-time' }
          }
        },
        ProjectStatus: { type: 'string', enum: [...projectStatusSchema.options] },
        ProjectStatusResponse: {
          type: 'object',
          required: ['code', 'label', 'version_number', 'created_at', 'notes'],
          properties: {
            code: { $ref: '#/components/schemas/ProjectStatus' },
            evaluation_id: { type: 'integer', nullable: true },
            project_version_id: { type: 'integer' },
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
            project_version_id: { type: 'integer' },
            delivery_number: { type: 'integer', minimum: 0 },
            questionnaire_id: { type: 'integer', nullable: true },
            document_type: { type: 'string', example: 'project_docx' },
            original_filename: { type: 'string', example: 'projeto-v1.docx' },
            created_at: { type: 'string', format: 'date-time' },
            download_url: { type: 'string', example: '/api/admin/projects/42/documents/101/download' },
          },
        },
        ProjectResponse: {
          type: 'object',
          required: ['id', 'project_version_id', 'title', 'updated_at', 'researcher', 'status', 'documents'],
          properties: {
            id: { type: 'integer', example: 42 },
            project_version_id: { type: 'integer', nullable: true, example: 84 },
            title: { type: 'string', example: 'Projeto de pesquisa' },
            updated_at: { type: 'string', format: 'date-time' },
            evaluation_status: { $ref: '#/components/schemas/ProjectEvaluationStatus' },
            current_version: {
              type: 'object', nullable: true, properties: {
                id: { type: 'integer' }, version_number: { type: 'integer' }, status: { type: 'string' }, revision_evaluation_id: { type: 'integer', nullable: true }
              }
            },
            versions: {
              type: 'array', items: {
                type: 'object', properties: {
                  id: { type: 'integer' }, version_number: { type: 'integer' }, status: { type: 'string' }, source_wizard_session_id: { type: 'integer' },
                  revision_evaluation_id: { type: 'integer', nullable: true }, characterization_snapshot: { type: 'object', additionalProperties: true },
                  submitted_at: { type: 'string', format: 'date-time', nullable: true }
                }
              }
            },
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
          required: ['id', 'version_number', 'status', 'justification', 'evaluated_at', 'updated_at'],
          properties: {
            id: { type: 'integer', example: 8 },
            project_version_id: { type: 'integer' },
            round_number: { type: 'integer', minimum: 1 },
            delivery_number: { type: 'integer', minimum: 0 },
            version_number: { type: 'integer', example: 2 },
            status: { $ref: '#/components/schemas/EvaluationStatus' },
            justification: { type: 'string', nullable: true },
            certification_decision: { type: 'string', nullable: true, enum: ['granted', 'not_granted'] },
            certification_reason: { type: 'string', nullable: true },
            evaluated_at: { type: 'string', format: 'date-time', nullable: true },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        SpecialtyResponse: {
          type: 'object',
          required: ['id', 'code', 'name', 'description', 'guidance_context', 'is_active', 'created_at', 'updated_at'],
          properties: {
            id: { type: 'integer', example: 1 },
            code: { type: 'string', example: 'epidemiology' },
            name: { type: 'string', example: 'Epidemiologia' },
            description: { type: 'string' },
            guidance_context: { type: 'string' },
            is_active: { type: 'boolean', example: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        SpecialtiesListResponse: {
          type: 'object',
          required: ['items', 'pagination'],
          properties: {
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/SpecialtyResponse' },
            },
            pagination: {
              type: 'object',
              required: ['page', 'page_size', 'total_items', 'total_pages'],
              properties: {
                page: { type: 'integer', example: 1 },
                page_size: { type: 'integer', example: 20 },
                total_items: { type: 'integer', example: 42 },
                total_pages: { type: 'integer', example: 3 },
              },
            },
          },
        },
        CreateSpecialty: {
          type: 'object',
          required: ['code', 'name'],
          properties: {
            code: { type: 'string', maxLength: 100 },
            name: { type: 'string', maxLength: 255 },
            description: { type: 'string', maxLength: 2000 },
            guidance_context: { type: 'string', maxLength: 4000 },
          },
        },
        UpdateSpecialty: {
          type: 'object',
          properties: {
            name: { type: 'string', maxLength: 255 },
            description: { type: 'string', maxLength: 2000 },
            guidance_context: { type: 'string', maxLength: 4000 },
          },
        },
        UpdateSpecialtyStatus: {
          type: 'object',
          required: ['is_active'],
          properties: {
            is_active: { type: 'boolean' },
          },
        },
        QuestionnaireOption: {
          type: 'object',
          required: ['id', 'value'],
          additionalProperties: false,
          properties: {
            id: { type: 'string', pattern: '^[a-z][a-z0-9]*(?:[_-][a-z0-9]+)*$', example: 'base_niar' },
            value: { type: 'string', minLength: 1, maxLength: 255, example: 'Base do NIAR' },
          },
        },
        QuestionnaireQuestion: {
          description: 'O id identifica a resposta; não existe answer_key. Radio representa escolha única, checkbox múltipla escolha e select uma lista suspensa.',
          oneOf: [
            {
              type: 'object',
              required: ['id', 'type', 'label', 'required'],
              additionalProperties: false,
              properties: {
                ...questionnaireQuestionProperties,
                type: { type: 'string', enum: [...QUESTIONNAIRE_TEXT_TYPES] },
              },
            },
            {
              type: 'object',
              required: ['id', 'type', 'label', 'required', 'options'],
              additionalProperties: false,
              properties: {
                ...questionnaireQuestionProperties,
                type: { type: 'string', enum: [...QUESTIONNAIRE_CHOICE_TYPES] },
                options: { type: 'array', minItems: 2, items: { $ref: '#/components/schemas/QuestionnaireOption' } },
              },
            },
          ],
        },
        QuestionnaireInformation: {
          type: 'object',
          additionalProperties: false,
          required: ['content', 'severity'],
          description: 'Informação de apoio exibida em Alert, vinculada à questão ou ao grupo. Omitir o objeto quando Adicionar informação estiver desmarcado; quando marcado, texto e tipo são obrigatórios.',
          properties: {
            content: { type: 'string', minLength: 1, maxLength: 20000, description: 'Texto informativo em Markdown. Renderizar sem HTML arbitrário.' },
            severity: { type: 'string', enum: [...QUESTIONNAIRE_INFORMATION_SEVERITIES] },
          },
        },
        QuestionnaireGroupField: {
          type: 'object',
          additionalProperties: false,
          required: ['id', 'label', 'type'],
          description: 'Campo interno do grupo. Texto longo marcado corresponde a textarea; desmarcado, text. Não aceita alternativas nem grupos aninhados.',
          properties: {
            id: { type: 'string', minLength: 1, maxLength: 100, pattern: '^[a-z][a-z0-9]*(?:[_-][a-z0-9]+)*$' },
            label: { type: 'string', minLength: 1, maxLength: 1000 },
            type: { type: 'string', enum: [...QUESTIONNAIRE_TEXT_TYPES] },
          },
        },
        QuestionnaireGroup: {
          type: 'object',
          additionalProperties: false,
          required: ['id', 'type', 'fields'],
          description: 'Grupo de campos configurados na etapa 3. Título/enunciado geral e informação de apoio são opcionais. Quantidade e ordem derivam de fields; não é um grupo repetível.',
          properties: {
            id: { type: 'string', pattern: '^[a-z][a-z0-9]*(?:[_-][a-z0-9]+)*$', maxLength: 100 },
            type: { type: 'string', enum: ['group'] },
            title: { type: 'string', minLength: 1, maxLength: 1000 },
            information: { $ref: '#/components/schemas/QuestionnaireInformation' },
            fields: { type: 'array', minItems: 1, items: { $ref: '#/components/schemas/QuestionnaireGroupField' } },
          },
        },
        QuestionnaireItem: {
          oneOf: [
            { $ref: '#/components/schemas/QuestionnaireQuestion' },
            { $ref: '#/components/schemas/QuestionnaireGroup' },
          ],
        },
        QuestionnaireSection: {
          type: 'object',
          required: ['id', 'title', 'questions'],
          additionalProperties: false,
          properties: {
            id: { type: 'string', pattern: '^[a-z][a-z0-9]*(?:[_-][a-z0-9]+)*$', example: 'contexto' },
            title: { type: 'string', minLength: 1, maxLength: 255 },
            description: { type: 'string', maxLength: 2000 },
            questions: { type: 'array', minItems: 1, items: { $ref: '#/components/schemas/QuestionnaireItem' } },
          },
          description: 'Questões individuais e grupos na ordem do array questions. IDs de questões, grupos e campos únicos na definição. A informação de apoio pertence à questão ou ao grupo e não é um elemento independente.',
        },
        CreateQuestionnaireInput: {
          type: 'object',
          description: 'A API atribui automaticamente a próxima versão da mesma chave. Não envie version. Para copiar uma versão, mantenha título e chave e envie as seções copiadas.',
          required: ['key', 'title', 'sections'],
          additionalProperties: false,
          properties: questionnaireInputProperties,
          example: {
            key: 'formulario_fiar',
            title: 'Formulário de entrada FIAR',
            sections: [{
              id: 'contexto',
              title: 'Contexto da pesquisa',
              description: 'Informe os objetivos da pesquisa.',
              questions: [
                {
                  id: 'fontes_dados', type: 'radio', label: 'Qual será a fonte dos dados?', required: true,
                  information: { content: 'Informe se os dados são de base própria ou do NIAR.', severity: 'info' },
                  options: [{ id: 'base_propria', value: 'Base própria' }, { id: 'base_niar', value: 'Base do NIAR' }],
                },
                {
                  id: 'campos_sensiveis', type: 'group', title: 'Campos com dados sensíveis',
                  fields: [
                    { id: 'campo', label: 'Campo', type: 'text' },
                    { id: 'tipo_dado_sensivel', label: 'Tipo de dado sensível', type: 'text' },
                    { id: 'medida_protecao', label: 'Medida de proteção aplicada', type: 'textarea' },
                  ],
                },
              ],
            }],
          },
        },
        UpdateQuestionnaireInput: {
          type: 'object',
          description: 'Substitui as seções de uma versão nunca publicada. Não aceita chave, título, versão ou estado de publicação.',
          required: ['sections'],
          additionalProperties: false,
          properties: { sections: questionnaireInputProperties.sections },
        },
        QuestionnaireDefinition: {
          type: 'object',
          required: ['key', 'version', 'title', 'sections'],
          additionalProperties: false,
          properties: {
            ...questionnaireInputProperties,
            version: { type: 'integer', minimum: 1, maximum: 2147483647, readOnly: true, example: 1, description: 'Sequencial por chave. Exibir como 1.0, 2.0 etc.; não é SemVer.' },
          },
        },
        QuestionnaireResponse: {
          type: 'object',
          required: ['id', 'key', 'version', 'title', 'definition_json', 'is_active', 'published_at', 'created_at', 'updated_at'],
          properties: {
            id: { type: 'integer', example: 1 },
            key: { type: 'string', example: 'formulario_fiar' },
            version: { type: 'integer', minimum: 1, example: 1, description: 'Versão gerada automaticamente; exibir com sufixo .0.' },
            title: { type: 'string', example: 'Formulário de entrada FIAR' },
            definition_json: { $ref: '#/components/schemas/QuestionnaireDefinition' },
            is_active: { type: 'boolean', example: false },
            published_at: { type: 'string', format: 'date-time', nullable: true, description: 'Nulo: salvo e editável. Preenchido: conteúdo imutável, mesmo quando inativo.' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        QuestionnairesListResponse: {
          type: 'object',
          required: ['items', 'pagination'],
          properties: {
            items: { type: 'array', items: { $ref: '#/components/schemas/QuestionnaireResponse' } },
            pagination: {
              type: 'object',
              required: ['page', 'page_size', 'total_items', 'total_pages'],
              properties: {
                page: { type: 'integer', example: 1 },
                page_size: { type: 'integer', example: 20 },
                total_items: { type: 'integer', example: 2 },
                total_pages: { type: 'integer', example: 1 },
              },
            },
          },
        },
        ProjectSection: {
          type: 'object',
          additionalProperties: false,
          required: ['key', 'label', 'guidance', 'required'],
          properties: {
            key: { type: 'string', pattern: '^[a-z][a-z0-9]*(?:[_-][a-z0-9]+)*$', example: 'background' },
            label: { type: 'string', example: 'Contexto' },
            guidance: { type: 'array', items: { type: 'string' }, example: ['Contexto clínico/científico e por que este estudo é relevante.'] },
            prompt: { type: 'string', description: 'Prompt específico opcional, aceito na entrada e omitido nas respostas públicas da sessão.' },
            required: { type: 'boolean', example: true },
          },
        },
        ProjectSectionTemplateDefinition: {
          type: 'object',
          additionalProperties: false,
          required: ['schema_version', 'sections'],
          properties: {
            schema_version: { type: 'integer', minimum: 1, example: 1 },
            sections: { type: 'array', minItems: 1, items: { $ref: '#/components/schemas/ProjectSection' } },
          },
        },
        CreateProjectSectionTemplateInput: {
          type: 'object',
          additionalProperties: false,
          required: ['template_key', 'name', 'definition_json'],
          properties: {
            template_key: { type: 'string', example: 'project_doc_sections' },
            name: { type: 'string', example: 'Seções do projeto escrito' },
            definition_json: { $ref: '#/components/schemas/ProjectSectionTemplateDefinition' },
          },
        },
        UpdateProjectSectionTemplateInput: {
          type: 'object',
          additionalProperties: false,
          required: ['name', 'definition_json'],
          properties: {
            name: { type: 'string', example: 'Seções do projeto escrito' },
            definition_json: { $ref: '#/components/schemas/ProjectSectionTemplateDefinition' },
          },
        },
        ProjectSectionTemplateResponse: {
          type: 'object',
          required: ['id', 'template_key', 'name', 'version', 'definition_json', 'is_active', 'published_at', 'created_at', 'updated_at'],
          properties: {
            id: { type: 'integer', example: 1 },
            template_key: { type: 'string', example: 'project_doc_sections' },
            name: { type: 'string', example: 'Seções do projeto escrito' },
            version: { type: 'integer', minimum: 1, example: 1 },
            definition_json: { $ref: '#/components/schemas/ProjectSectionTemplateDefinition' },
            is_active: { type: 'boolean', example: true },
            published_at: { type: 'string', format: 'date-time', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        ProjectSectionTemplatesListResponse: {
          type: 'object',
          required: ['items', 'pagination'],
          properties: {
            items: { type: 'array', items: { $ref: '#/components/schemas/ProjectSectionTemplateResponse' } },
            pagination: {
              type: 'object',
              required: ['page', 'page_size', 'total_items', 'total_pages'],
              properties: {
                page: { type: 'integer', example: 1 },
                page_size: { type: 'integer', example: 20 },
                total_items: { type: 'integer', example: 1 },
                total_pages: { type: 'integer', example: 1 },
              },
            },
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
