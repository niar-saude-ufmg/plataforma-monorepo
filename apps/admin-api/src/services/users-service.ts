import { hash } from "bcryptjs";
import type { UserRole } from "@niar/contracts";
import { AppError } from "../errors/app-error.js";
import type { AuthenticatedUser } from "../middlewares/auth.js";
import { usersRepository } from "../repositories/users-repository.js";
import {
  removeStoredCoepDocument,
  storeCoepDocument,
  type UploadedCoepDocument
} from "./coep-document-storage.js";
import { CreatePublicUserInput, CreateUserByAdminInput, ListUsersQuery, PublicUserCreatedResponse, UserResponse } from "../schemas/user-schema.js";

// Usado pelo cadastro administrativo (rota protegida), que grava só o usuário.
// O cadastro público tem caminho próprio, porque também grava perfil e COEP.

type BasicUserInput = { full_name: string; email: string; password: string };

const saveUser = async (data: BasicUserInput, role: UserRole): Promise<UserResponse> => {
  const existing = await usersRepository.findByEmail(data.email);

  if (existing) {
    throw new AppError("User with this email already exists", 409);
  }

  // Hash em 10 rounds, padrão do bcrypt do Python, compatível com o assistente
  const hashedPassword = await hash(data.password, 10);

  const user = await usersRepository.create({
    fullName: data.full_name,
    email: data.email,
    hashedPassword,
    role
  });

  return {
    id: user.id,
    email: user.email,
    full_name: user.fullName,
    role: user.role,
    is_active: user.accountStatus === "active",
    created_at: user.createdAt.toISOString()
  };
};

export const usersService = {
  listUsers: async (query: ListUsersQuery, currentUser: AuthenticatedUser): Promise<UserResponse[]> => {
    let role = query.role;

    // Committee só vê researcher, mesmo sem filtro. Se solicitar outro papel
    // explicitamente, a requisição é negada em vez de filtrada
    // silenciosamente, deixando claro que o pedido está fora do escopo.
    if (currentUser.role === "committee") {
      if (role && role !== "researcher") {
        throw new AppError("Comitê só pode listar pesquisadores", 403);
      }
      role = "researcher";
    }

    const users = await usersRepository.findAll({ role, page: query.page, pageSize: query.page_size });

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      full_name: user.fullName,
      role: user.role,
      is_active: user.accountStatus === "active",
      created_at: user.createdAt.toISOString()
    }));
  },

    // Cadastro público: cria pesquisador, perfil, dados acadêmicos e COEP numa transação só. A role nunca vem do cliente, é sempre researcher.
  createUser: async (
    data: CreatePublicUserInput,
    document: UploadedCoepDocument
  ): Promise<PublicUserCreatedResponse> => {
    const existing = await usersRepository.findByEmail(data.email);

    if (existing) {
      throw new AppError("User with this email already exists", 409);
    }

    const hashedPassword = await hash(data.password, 10);

    const storedDocument = await storeCoepDocument(document);
    let created;

    try {
      // Traduz snake_case (formato da requisição) para camelCase (formato do Prisma) e converte a data para o tipo que a coluna DATE espera.
      created = await usersRepository.createResearcherWithProfile({
        fullName: data.full_name,
        email: data.email,
        hashedPassword,
        profile: {
          phone: data.profile.phone,
          institution: data.profile.institution,
          organizationalUnit: data.profile.organizational_unit,
          contactAddress: data.profile.contact_address
        },
        researcherProfile: {
          researchArea: data.researcher_profile.research_area,
          position: data.researcher_profile.position
        },
        coep: {
          caae: data.coep.caae,
          opinionNumber: data.coep.opinion_number,
          approvalDate: new Date(`${data.coep.approval_date}T00:00:00.000Z`),
          documentFilename: storedDocument.filename,
          documentStoragePath: storedDocument.storagePath
        }
      });

    } catch (error) {
      await removeStoredCoepDocument(storedDocument.storagePath);
      throw error;
    }

    // Volta para snake_case na resposta. Campos montados um a um: nada é repassado em bloco, então senha, hash e caminho de armazenamento não têm como escapar por descuido.
    return {
      id: created.user.id,
      email: created.user.email,
      full_name: created.user.fullName,
      role: created.user.role,
      is_active: created.user.accountStatus === "active",
      created_at: created.user.createdAt.toISOString(),
      profile: {
        phone: created.profile.phone ?? "",
        institution: created.profile.institution ?? "",
        organizational_unit: created.profile.organizationalUnit ?? "",
        contact_address: created.profile.contactAddress ?? ""
      },
      researcher_profile: {
        research_area: created.researcherProfile.researchArea ?? "",
        position: created.researcherProfile.position ?? ""
      },
      coep: {
        caae: created.coep.caae,
        opinion_number: created.coep.opinionNumber,
        // Só a parte da data, sem hora: a coluna é DATE.
        approval_date: created.coep.approvalDate.toISOString().slice(0, 10),
        document_filename: created.coep.documentFilename
      }
    };
  },

  // A rota já garantiu que quem chama é admin, então aceita a role enviada.
  createUserByAdmin: (data: CreateUserByAdminInput) => saveUser(data, data.role)
};
