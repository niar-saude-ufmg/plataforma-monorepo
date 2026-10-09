import { jest } from "@jest/globals";
import request from "supertest";
import jwt from "jsonwebtoken";
import { hash } from "bcryptjs";
import type { UserRole } from "@niar/contracts";

process.env.SECRET_KEY = "test-secret";

type StoredUser = {
  id: number;
  email: string;
  fullName: string;
  hashedPassword: string;
  role: UserRole;
  accountStatus: "pending" | "active" | "rejected" | "disabled";
  createdAt: Date;
  profile?: {
    phone: string | null;
    institution: string | null;
    organizationalUnit: string | null;
    contactAddress: string | null;
  };
  researcherProfile?: { researchArea: string | null; position: string | null };
  committeeProfile?: {
    specialty: {
      id: number;
      code: string;
      name: string;
      description: string;
      guidanceContext: string;
      isActive: boolean;
    };
  };
  coepData: Array<{
    caae: string;
    opinionNumber: string;
    approvalDate: Date;
    documentFilename: string;
  }>;
};

const findByEmail = jest.fn<() => Promise<StoredUser | null>>();
const findById = jest.fn<(id: number) => Promise<StoredUser | null>>();
const findSessionById = jest.fn<(id: number) => Promise<StoredUser | null>>();
const updateBasicData = jest.fn<
  (
    id: number,
    data: { fullName?: string; email?: string; hashedPassword?: string; phone?: string }
  ) => Promise<StoredUser>
>();

// Mesma técnica dos outros testes: mocka o repository antes de importar o
// app, pra não depender de um Postgres real.
jest.unstable_mockModule("../src/repositories/users-repository.js", () => ({
  usersRepository: { findByEmail, findById, findSessionById, updateBasicData }
}));

const { app } = await import("../src/app.js");

const PASSWORD = "senha12345";

// hash real (não mockado): precisa ser um hash de verdade pra bcrypt.compare
// no service conseguir validar a senha certa.
const buildStoredUser = async (overrides: Partial<StoredUser> = {}): Promise<StoredUser> => ({
  id: 1,
  email: "pesquisador@niar.local",
  fullName: "Pesquisador Um",
  hashedPassword: await hash(PASSWORD, 10),
  role: "researcher",
  accountStatus: "active",
  createdAt: new Date("2026-08-25T15:00:00.000Z"),
  coepData: [],
  ...overrides
});

const tokenFor = (userId: number) => jwt.sign({ sub: String(userId) }, process.env.SECRET_KEY!, { algorithm: "HS256" });

describe("POST /api/admin/auth/login", () => {
  beforeEach(() => {
    findByEmail.mockReset();
  });

  it("retorna o token quando email e senha estão corretos", async () => {
    findByEmail.mockResolvedValueOnce(await buildStoredUser());

    const response = await request(app)
      .post("/api/admin/auth/login")
      .send({ email: "pesquisador@niar.local", password: PASSWORD });

    expect(response.status).toBe(200);
    expect(response.body.token_type).toBe("bearer");
    expect(typeof response.body.access_token).toBe("string");
  });

  it("retorna 401 quando a senha está errada", async () => {
    findByEmail.mockResolvedValueOnce(await buildStoredUser());

    const response = await request(app)
      .post("/api/admin/auth/login")
      .send({ email: "pesquisador@niar.local", password: "senhaerrada" });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Credenciais incorretas");
  });

  it("retorna 401 quando o email não existe", async () => {
    findByEmail.mockResolvedValueOnce(null);

    const response = await request(app)
      .post("/api/admin/auth/login")
      .send({ email: "naoexiste@niar.local", password: PASSWORD });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Credenciais incorretas");
  });

  it("retorna 403 quando o usuário está desativado", async () => {
    findByEmail.mockResolvedValueOnce(await buildStoredUser({ accountStatus: "disabled" }));

    const response = await request(app)
      .post("/api/admin/auth/login")
      .send({ email: "pesquisador@niar.local", password: PASSWORD });

    expect(response.status).toBe(403);
    expect(response.body.error).toBe("Conta desativada");
  });

  it("retorna 403 quando o cadastro ainda está pendente", async () => {
    findByEmail.mockResolvedValueOnce(await buildStoredUser({ accountStatus: "pending" }));

    const response = await request(app)
      .post("/api/admin/auth/login")
      .send({ email: "pesquisador@niar.local", password: PASSWORD });

    expect(response.status).toBe(403);
    expect(response.body.error).toBe("Conta desativada");
  });

  it("retorna 400 para email em formato inválido", async () => {
    const response = await request(app)
      .post("/api/admin/auth/login")
      .send({ email: "emailinvalido", password: PASSWORD });

    expect(response.status).toBe(400);
    expect(findByEmail).not.toHaveBeenCalled();
  });
});

describe("GET /api/admin/auth/me", () => {
  beforeEach(() => {
    findById.mockReset();
    findSessionById.mockReset();
  });

  it("retorna os dados do usuário autenticado", async () => {
    findById.mockResolvedValueOnce(await buildStoredUser());
    findSessionById.mockResolvedValueOnce(await buildStoredUser());

    const response = await request(app).get("/api/admin/auth/me").set("Authorization", `Bearer ${tokenFor(1)}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: 1,
      email: "pesquisador@niar.local",
      full_name: "Pesquisador Um",
      role: "researcher",
      account_status: "active"
    });
  });

  it("não expõe password nem hashed_password na resposta", async () => {
    findById.mockResolvedValueOnce(await buildStoredUser());
    findSessionById.mockResolvedValueOnce(await buildStoredUser());

    const response = await request(app).get("/api/admin/auth/me").set("Authorization", `Bearer ${tokenFor(1)}`);

    expect(response.body).not.toHaveProperty("password");
    expect(response.body).not.toHaveProperty("hashed_password");
    expect(response.body).not.toHaveProperty("hashedPassword");
  });

  it("retorna 401 sem token", async () => {
    const response = await request(app).get("/api/admin/auth/me");

    expect(response.status).toBe(401);
  });

  it("retorna os dados específicos do perfil de pesquisador", async () => {
    const researcher = await buildStoredUser({
      profile: {
        phone: "(31) 99999-9999",
        institution: "UFMG",
        organizationalUnit: "DCC",
        contactAddress: "Belo Horizonte - MG"
      },
      researcherProfile: {
        researchArea: "Saúde pública",
        position: "Professor"
      },
      coepData: [{
        caae: "12345678.9.0000.0000",
        opinionNumber: "1234.567",
        approvalDate: new Date("2026-09-25T00:00:00.000Z"),
        documentFilename: "parecer-coep.pdf"
      }]
    });
    findById.mockResolvedValueOnce(researcher);
    findSessionById.mockResolvedValueOnce(researcher);

    const response = await request(app)
      .get("/api/admin/auth/me")
      .set("Authorization", `Bearer ${tokenFor(1)}`);

    expect(response.body.profile).toEqual({
      phone: "(31) 99999-9999",
      institution: "UFMG",
      organizational_unit: "DCC",
      contact_address: "Belo Horizonte - MG"
    });
    expect(response.body.researcher_profile).toEqual({
      research_area: "Saúde pública",
      position: "Professor"
    });
    expect(response.body.coep).toEqual({
      caae: "12345678.9.0000.0000",
      opinion_number: "1234.567",
      approval_date: "2026-09-25",
      document_filename: "parecer-coep.pdf"
    });
  });

  it("retorna somente o bloco específico do comitê", async () => {
    const committee = await buildStoredUser({
      role: "committee",
      committeeProfile: {
        specialty: {
          id: 1,
          code: "CC",
          name: "Ciência da Computação",
          description: "Descrição",
          guidanceContext: "Responsabilidade da especialidade",
          isActive: true
        }
      }
    });
    findById.mockResolvedValueOnce(committee);
    findSessionById.mockResolvedValueOnce(committee);

    const response = await request(app)
      .get("/api/admin/auth/me")
      .set("Authorization", `Bearer ${tokenFor(1)}`);

    expect(response.body.committee_profile).toEqual({
      specialty: {
        id: 1,
        code: "CC",
        name: "Ciência da Computação"
      }
    });
    expect(response.body).not.toHaveProperty("profile");
    expect(response.body).not.toHaveProperty("coep");
  });

  it("retorna somente os dados básicos para administrador", async () => {
    const administrator = await buildStoredUser({ role: "admin" });
    findById.mockResolvedValueOnce(administrator);
    findSessionById.mockResolvedValueOnce(administrator);

    const response = await request(app)
      .get("/api/admin/auth/me")
      .set("Authorization", `Bearer ${tokenFor(1)}`);

    expect(Object.keys(response.body).sort()).toEqual([
      "account_status",
      "email",
      "full_name",
      "id",
      "role"
    ]);
  });
});

describe("PATCH /api/admin/auth/me", () => {
  beforeEach(() => {
    findById.mockReset();
    findByEmail.mockReset();
    findSessionById.mockReset();
    updateBasicData.mockReset();
  });

  it("retorna 401 sem token", async () => {
    const response = await request(app)
      .patch("/api/admin/auth/me")
      .send({ full_name: "Nome Novo" });

    expect(response.status).toBe(401);
    expect(updateBasicData).not.toHaveBeenCalled();
  });

  it("atualiza nome e e-mail do usuário autenticado", async () => {
    const stored = await buildStoredUser();
    findById.mockResolvedValue(stored);
    findByEmail.mockResolvedValueOnce(null);
    updateBasicData.mockResolvedValueOnce({
      ...stored,
      fullName: "Nome Novo",
      email: "novo@niar.local"
    });

    const response = await request(app)
      .patch("/api/admin/auth/me")
      .set("Authorization", `Bearer ${tokenFor(1)}`)
      .send({ full_name: "Nome Novo", email: "novo@niar.local" });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      full_name: "Nome Novo",
      email: "novo@niar.local",
      account_status: "active"
    });
  });

  it("permite ao pesquisador atualizar o telefone no perfil", async () => {
    const stored = await buildStoredUser({
      profile: {
        phone: "(31) 98888-8888",
        institution: "UFMG",
        organizationalUnit: "DCC",
        contactAddress: "Belo Horizonte - MG"
      }
    });
    findById.mockResolvedValue(stored);
    updateBasicData.mockResolvedValueOnce({
      ...stored,
      profile: { ...stored.profile!, phone: "(31) 99999-9999" }
    });

    const response = await request(app)
      .patch("/api/admin/auth/me")
      .set("Authorization", `Bearer ${tokenFor(1)}`)
      .send({ phone: "(31) 99999-9999" });

    expect(response.status).toBe(200);
    expect(updateBasicData).toHaveBeenCalledWith(1, expect.objectContaining({
      phone: "(31) 99999-9999"
    }));
  });

  it("não permite que administrador ou comitê alterem telefone", async () => {
    const administrator = await buildStoredUser({ role: "admin" });
    findById.mockResolvedValue(administrator);

    const response = await request(app)
      .patch("/api/admin/auth/me")
      .set("Authorization", `Bearer ${tokenFor(1)}`)
      .send({ phone: "(31) 99999-9999" });

    expect(response.status).toBe(400);
    expect(updateBasicData).not.toHaveBeenCalled();
  });

  it("usa o id do token, não um id enviado no corpo", async () => {
    const stored = await buildStoredUser({ id: 7 });
    findById.mockResolvedValue(stored);
    updateBasicData.mockResolvedValueOnce({ ...stored, fullName: "Nome Novo" });

    // "user_id" não existe no schema: o corpo inteiro é recusado antes de
    // chegar ao service, então não há como apontar para outro usuário.
    const response = await request(app)
      .patch("/api/admin/auth/me")
      .set("Authorization", `Bearer ${tokenFor(7)}`)
      .send({ user_id: 999, full_name: "Nome Novo" });

    expect(response.status).toBe(400);
    expect(updateBasicData).not.toHaveBeenCalled();

    // sem o campo extra, a edição ocorre e sempre no id do token
    const ok = await request(app)
      .patch("/api/admin/auth/me")
      .set("Authorization", `Bearer ${tokenFor(7)}`)
      .send({ full_name: "Nome Novo" });

    expect(ok.status).toBe(200);
    expect(updateBasicData).toHaveBeenCalledWith(7, expect.anything());
  });

  it("retorna 409 quando o e-mail já pertence a outro usuário", async () => {
    findById.mockResolvedValue(await buildStoredUser({ id: 1 }));
    findByEmail.mockResolvedValueOnce(await buildStoredUser({ id: 2, email: "ocupado@niar.local" }));

    const response = await request(app)
      .patch("/api/admin/auth/me")
      .set("Authorization", `Bearer ${tokenFor(1)}`)
      .send({ email: "ocupado@niar.local" });

    expect(response.status).toBe(409);
    expect(updateBasicData).not.toHaveBeenCalled();
  });

  it("aceita o próprio e-mail sem tratar como conflito", async () => {
    const stored = await buildStoredUser({ id: 1, email: "pesquisador@niar.local" });
    findById.mockResolvedValue(stored);
    updateBasicData.mockResolvedValueOnce(stored);

    const response = await request(app)
      .patch("/api/admin/auth/me")
      .set("Authorization", `Bearer ${tokenFor(1)}`)
      .send({ email: "pesquisador@niar.local" });

    expect(response.status).toBe(200);
  });

  it("rejeita senha atual incorreta", async () => {
    findById.mockResolvedValue(await buildStoredUser());

    const response = await request(app)
      .patch("/api/admin/auth/me")
      .set("Authorization", `Bearer ${tokenFor(1)}`)
      .send({ current_password: "senha-errada", password: "nova-senha-123" });

    expect(response.status).toBe(400);
    expect(updateBasicData).not.toHaveBeenCalled();
  });

  it("exige current_password quando password é enviado", async () => {
    findById.mockResolvedValue(await buildStoredUser());

    const response = await request(app)
      .patch("/api/admin/auth/me")
      .set("Authorization", `Bearer ${tokenFor(1)}`)
      .send({ password: "nova-senha-123" });

    expect(response.status).toBe(400);
    expect(updateBasicData).not.toHaveBeenCalled();
  });

  it("grava a senha nova com hash e permite logar com ela", async () => {
    const stored = await buildStoredUser();
    findById.mockResolvedValue(stored);
    updateBasicData.mockImplementationOnce(async (_id, data) => ({
      ...stored,
      hashedPassword: data.hashedPassword as string
    }));

    const novaSenha = "nova-senha-123";
    const patch = await request(app)
      .patch("/api/admin/auth/me")
      .set("Authorization", `Bearer ${tokenFor(1)}`)
      .send({ current_password: PASSWORD, password: novaSenha });

    expect(patch.status).toBe(200);

    // o hash gravado não é a senha em texto puro
    const gravado = updateBasicData.mock.calls[0][1].hashedPassword as string;
    expect(gravado).not.toBe(novaSenha);

    // e o login com a senha nova funciona contra esse hash
    findByEmail.mockResolvedValueOnce({ ...stored, hashedPassword: gravado });
    const login = await request(app)
      .post("/api/admin/auth/login")
      .send({ email: stored.email, password: novaSenha });

    expect(login.status).toBe(200);
    expect(login.body.access_token).toBeDefined();
  });

  it("rejeita campos não permitidos", async () => {
    findById.mockResolvedValue(await buildStoredUser());

    for (const corpo of [
      { role: "admin" },
      { account_status: "disabled" },
      { full_name: "Nome", is_active: false }
    ]) {
      const response = await request(app)
        .patch("/api/admin/auth/me")
        .set("Authorization", `Bearer ${tokenFor(1)}`)
        .send(corpo);

      expect(response.status).toBe(400);
    }

    expect(updateBasicData).not.toHaveBeenCalled();
  });

  it("rejeita corpo vazio", async () => {
    findById.mockResolvedValue(await buildStoredUser());

    const response = await request(app)
      .patch("/api/admin/auth/me")
      .set("Authorization", `Bearer ${tokenFor(1)}`)
      .send({});

    expect(response.status).toBe(400);
    expect(updateBasicData).not.toHaveBeenCalled();
  });

  it("nunca devolve senha, hash ou dados fora do escopo", async () => {
    const stored = await buildStoredUser();
    findById.mockResolvedValue(stored);
    updateBasicData.mockResolvedValueOnce({ ...stored, fullName: "Nome Novo" });

    const response = await request(app)
      .patch("/api/admin/auth/me")
      .set("Authorization", `Bearer ${tokenFor(1)}`)
      .send({ full_name: "Nome Novo" });

    expect(response.body).not.toHaveProperty("password");
    expect(response.body).not.toHaveProperty("hashed_password");
    expect(response.body).not.toHaveProperty("hashedPassword");
    expect(response.body).not.toHaveProperty("created_at");
    expect(Object.keys(response.body).sort()).toEqual([
      "account_status",
      "email",
      "full_name",
      "id",
      "role"
    ]);
  });
});
