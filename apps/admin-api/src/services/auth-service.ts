import { compare, hash } from "bcryptjs";
import { AppError } from "../errors/app-error.js";
import { signAccessToken } from "../middlewares/auth.js";
import { usersRepository } from "../repositories/users-repository.js";
import type { SessionUserRecord } from "../repositories/users-repository.js";
import { LoginInput, SessionUserResponse, UpdateMeInput } from "../schemas/auth-schema.js";

// Mesmo custo do cadastro e do bcrypt do assistente.
const PASSWORD_HASH_ROUNDS = 10;

// Único lugar que monta a resposta da sessão: GET e PATCH /auth/me usam este formato.
const toSessionUser = (user: SessionUserRecord): SessionUserResponse => {
  const response: SessionUserResponse = {
    id: user.id,
    email: user.email,
    full_name: user.fullName,
    role: user.role,
    account_status: user.accountStatus
  };

  if (user.role === "researcher") {
    if (user.profile) {
      response.profile = {
        phone: user.profile.phone,
        institution: user.profile.institution,
        organizational_unit: user.profile.organizationalUnit,
        contact_address: user.profile.contactAddress
      };
    }

    if (user.researcherProfile) {
      response.researcher_profile = {
        research_area: user.researcherProfile.researchArea,
        position: user.researcherProfile.position
      };
    }

    const coep = user.coepData[0];
    if (coep) {
      response.coep = {
        caae: coep.caae,
        opinion_number: coep.opinionNumber,
        approval_date: coep.approvalDate.toISOString().slice(0, 10),
        document_filename: coep.documentFilename
      };
    }
  }

  if (user.role === "committee" && user.committeeProfile) {
    response.committee_profile = {
      specialty: {
        id: user.committeeProfile.specialty.id,
        code: user.committeeProfile.specialty.code,
        name: user.committeeProfile.specialty.name,
        description: user.committeeProfile.specialty.description,
        guidance_context: user.committeeProfile.specialty.guidanceContext,
        is_active: user.committeeProfile.specialty.isActive
      }
    };
  }

  return response;
};

export const authService = {
  login: async (data: LoginInput): Promise<{ access_token: string; token_type: string }> => {
    const user = await usersRepository.findByEmail(data.email);

    // Mesma mensagem genérica pros dois casos (email não existe ou senha
    // errada). Não dá pra alguém descobrir se um email está cadastrado
    // só tentando logar com ele.
    if (!user) {
      throw new AppError("Credenciais incorretas", 401);
    }

    const passwordMatches = await compare(data.password, user.hashedPassword);
    if (!passwordMatches) {
      throw new AppError("Credenciais incorretas", 401);
    }

    if (user.accountStatus !== "active") {
      throw new AppError("Conta desativada", 403);
    }

    return {
      access_token: signAccessToken(user.id),
      token_type: "bearer"
    };
  },

  getSession: async (userId: number): Promise<SessionUserResponse> => {
    const user = await usersRepository.findSessionById(userId);
    if (!user) {
      throw new AppError("Usuário não encontrado", 401);
    }
    return toSessionUser(user);
  },

  // userId vem sempre do token, nunca do corpo.
  updateMe: async (userId: number, data: UpdateMeInput): Promise<SessionUserResponse> => {
    const current = await usersRepository.findById(userId);

    // Usuário sumiu do banco entre o authenticate e aqui.
    if (!current) {
      throw new AppError("Usuário não encontrado", 401);
    }

    // Só checa conflito se o e-mail realmente mudou. Reenviar o próprio e-mail não é conflito.
    if (data.email && data.email !== current.email) {
      const emailOwner = await usersRepository.findByEmail(data.email);
      if (emailOwner && emailOwner.id !== userId) {
        throw new AppError("E-mail já utilizado por outro usuário", 409);
      }
    }

    let hashedPassword: string | undefined;
    if (data.password) {
      // O schema já garantiu que current_password veio; aqui confirmamos que ela é a senha certa antes de deixar trocar.
      const currentPasswordMatches = await compare(
        data.current_password as string,
        current.hashedPassword
      );
      if (!currentPasswordMatches) {
        throw new AppError("Senha atual incorreta", 400);
      }

      hashedPassword = await hash(data.password, PASSWORD_HASH_ROUNDS);
    }

    if (data.phone !== undefined && current.role !== "researcher") {
      throw new AppError("Apenas pesquisadores podem alterar telefone", 400);
    }

    const updated = await usersRepository.updateBasicData(userId, {
      fullName: data.full_name,
      email: data.email,
      hashedPassword,
      phone: data.phone
    });

    return toSessionUser(updated);
  }
};
