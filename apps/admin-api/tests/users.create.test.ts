import { afterAll, jest } from "@jest/globals";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import request from "supertest";
import jwt from "jsonwebtoken";
import type { UserRole } from "@niar/contracts";

process.env.SECRET_KEY = "test-secret";
const exportsDirectory = mkdtempSync(path.join(tmpdir(), "niar-admin-api-"));
process.env.EXPORTS_DIR = exportsDirectory;

type StoredUser = {
  id: number;
  email: string;
  fullName: string;
  hashedPassword: string;
  role: UserRole;
  accountStatus: "pending" | "active" | "rejected" | "disabled";
  createdAt: Date;
};

const findByEmail = jest.fn<() => Promise<StoredUser | null>>();
const create = jest.fn<() => Promise<StoredUser>>();
const findById = jest.fn<(id: number) => Promise<StoredUser | null>>();
const createResearcherWithProfile = jest.fn<
  (data: { coep: { documentStoragePath: string } }) => Promise<CreatedResearcher>
>();

// Mesma técnica usada em users.list.test.ts: mocka o repository antes de qualquer coisa importar o app, pra n depender de um Postgres real.
jest.unstable_mockModule("../src/repositories/users-repository.js", () => ({
  usersRepository: { findByEmail, create, findById, createResearcherWithProfile }
}));

const { app } = await import("../src/app.js");

const buildStoredUser = (overrides: Partial<StoredUser> = {}): StoredUser => ({
  id: 1,
  email: "teste@niar.local.test",
  fullName: "Teste",
  hashedPassword: "hash-fake",
  role: "researcher",
  accountStatus: "active",
  createdAt: new Date("2026-08-25T15:00:00.000Z"),
  ...overrides
});

type CreatedResearcher = {
  user: StoredUser;
  profile: { phone: string; institution: string; organizationalUnit: string; contactAddress: string };
  researcherProfile: { researchArea: string; position: string };
  coep: { caae: string; opinionNumber: string; approvalDate: Date; documentFilename: string };
};

// O que o repository devolve depois da transacao. O teste nao toca no banco:
// interessa o comportamento da rota, nao o INSERT em si.
const buildCreatedResearcher = (overrides: Partial<CreatedResearcher> = {}): CreatedResearcher => ({
  user: buildStoredUser(),
  profile: {
    phone: "(31) 99999-9999",
    institution: "UFMG",
    organizationalUnit: "Faculdade de Medicina",
    contactAddress: "Belo Horizonte - MG"
  },
  researcherProfile: { researchArea: "Saude publica", position: "Professor" },
  coep: {
    caae: "12345678.9.0000.0000",
    opinionNumber: "1234.567",
    approvalDate: new Date("2026-09-25T00:00:00.000Z"),
    documentFilename: "parecer-coep.pdf"
  },
  ...overrides
});

// Campos JSON do cadastro público. O PDF é enviado separadamente no multipart.
const validPayload = () => ({
  full_name: "Teste",
  email: "teste@niar.local.test",
  password: "senha12345",
  profile: {
    phone: "(31) 99999-9999",
    institution: "UFMG",
    organizational_unit: "Faculdade de Medicina",
    contact_address: "Belo Horizonte - MG"
  },
  researcher_profile: { research_area: "Saude publica", position: "Professor" },
  coep: {
    caae: "12345678.9.0000.0000",
    opinion_number: "1234.567",
    approval_date: "2026-09-25"
  }
});

type PublicPayload = {
  full_name: string;
  email: string;
  password: string;
  profile?: Record<string, unknown>;
  researcher_profile?: Record<string, unknown>;
  coep?: Record<string, unknown>;
};

const publicRequest = (payload: PublicPayload = validPayload(), attachDocument = true, filename = "parecer-coep.pdf") => {
  const requestBuilder = request(app)
    .post("/api/admin/users")
    .field("full_name", payload.full_name)
    .field("email", payload.email)
    .field("password", payload.password);

  if (payload.profile) {
    requestBuilder.field("profile", JSON.stringify(payload.profile));
  }
  if (payload.researcher_profile) {
    requestBuilder.field("researcher_profile", JSON.stringify(payload.researcher_profile));
  }
  if (payload.coep) {
    requestBuilder.field("coep", JSON.stringify(payload.coep));
  }

  if (!attachDocument) {
    return requestBuilder;
  }

  return requestBuilder.attach("coep_document", Buffer.from("%PDF-1.7\nfixture pdf"), filename);
};

const tokenFor = (userId: number) => jwt.sign({ sub: String(userId) }, process.env.SECRET_KEY!, { algorithm: "HS256" });

afterAll(() => {
  rmSync(exportsDirectory, { recursive: true, force: true });
});

describe("POST /api/admin/users (público)", () => {
  beforeEach(() => {
    findByEmail.mockReset();
    create.mockReset();
    createResearcherWithProfile.mockReset();
  });

  it("cria pesquisador com perfil, dados academicos e COEP e retorna 201", async () => {
    findByEmail.mockResolvedValueOnce(null);
    createResearcherWithProfile.mockResolvedValueOnce(buildCreatedResearcher());

    const response = await publicRequest();

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      full_name: "Teste",
      email: "teste@niar.local.test",
      role: "researcher",
      is_active: true,
      profile: { institution: "UFMG", organizational_unit: "Faculdade de Medicina" },
      researcher_profile: { research_area: "Saude publica", position: "Professor" },
      coep: { caae: "12345678.9.0000.0000", approval_date: "2026-09-25" }
    });
  });

  it("ignora role enviada pelo cliente e cria sempre researcher", async () => {
    findByEmail.mockResolvedValueOnce(null);
    createResearcherWithProfile.mockResolvedValueOnce(buildCreatedResearcher());

    const response = await publicRequest();

    expect(response.status).toBe(201);
    expect(response.body.role).toBe("researcher");
    // O repository recebe os dados ja tratados: "role" nem chega ate ele.
    expect(createResearcherWithProfile).toHaveBeenCalledWith(
      expect.not.objectContaining({ role: "admin" })
    );
  });

  it("nao expoe password, hashed_password nem document_storage_path na resposta", async () => {
    findByEmail.mockResolvedValueOnce(null);
    createResearcherWithProfile.mockResolvedValueOnce(buildCreatedResearcher());

    const response = await publicRequest();

    expect(response.body).not.toHaveProperty("password");
    expect(response.body).not.toHaveProperty("hashed_password");
    expect(response.body.coep).not.toHaveProperty("document_storage_path");
    expect(JSON.stringify(response.body)).not.toContain("coep/usuarios");
  });

  it("converte a data do COEP e gera o caminho do arquivo no servidor", async () => {
    findByEmail.mockResolvedValueOnce(null);
    createResearcherWithProfile.mockResolvedValueOnce(buildCreatedResearcher());

    const response = await publicRequest();

    expect(response.status).toBe(201);
    expect(createResearcherWithProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        coep: expect.objectContaining({
          approvalDate: new Date("2026-09-25T00:00:00.000Z"),
          documentFilename: "parecer-coep.pdf",
          documentStoragePath: expect.stringMatching(
            new RegExp(`${exportsDirectory}/coep/usuarios/[a-f0-9-]+\\.pdf`)
          )
        })
      })
    );

    const storedPath = createResearcherWithProfile.mock.calls[0][0].coep.documentStoragePath;
    expect(existsSync(storedPath)).toBe(true);
    expect(readFileSync(storedPath, "ascii")).toContain("%PDF-");
  });

  it("ignora qualquer caminho de armazenamento enviado pelo cliente", async () => {
    findByEmail.mockResolvedValueOnce(null);
    createResearcherWithProfile.mockResolvedValueOnce(buildCreatedResearcher());
    const payload = validPayload();
    const response = await publicRequest({
      ...payload,
      coep: { ...payload.coep, document_storage_path: "../../etc/passwd" }
    });

    expect(response.status).toBe(201);
    expect(createResearcherWithProfile.mock.calls[0][0].coep.documentStoragePath).not.toContain(
      "etc/passwd"
    );
  });

  it("retorna 400 quando falta o bloco de COEP", async () => {
    const payload = validPayload();
    delete (payload as Record<string, unknown>).coep;

    const response = await publicRequest(payload as ReturnType<typeof validPayload>);

    expect(response.status).toBe(400);
    expect(response.body.error).toContain("campo coep");
    expect(createResearcherWithProfile).not.toHaveBeenCalled();
  });

  it("retorna 400 quando falta o perfil de contato", async () => {
    const payload = validPayload();
    delete (payload as Record<string, unknown>).profile;

    const response = await publicRequest(payload as ReturnType<typeof validPayload>);

    expect(response.status).toBe(400);
    expect(createResearcherWithProfile).not.toHaveBeenCalled();
  });

  it("retorna 400 quando faltam os dados de pesquisador", async () => {
    const payload = validPayload();
    delete (payload as Record<string, unknown>).researcher_profile;

    const response = await publicRequest(payload as ReturnType<typeof validPayload>);

    expect(response.status).toBe(400);
    expect(createResearcherWithProfile).not.toHaveBeenCalled();
  });

  it("retorna 400 para data de aprovacao em formato invalido", async () => {
    const payload = validPayload();
    payload.coep.approval_date = "25/09/2026";

    const response = await publicRequest(payload as ReturnType<typeof validPayload>);

    expect(response.status).toBe(400);
    expect(createResearcherWithProfile).not.toHaveBeenCalled();
  });

  it("retorna 400 para data que nao existe no calendario", async () => {
    const payload = validPayload();
    payload.coep.approval_date = "2026-02-30";

    const response = await request(app).post("/api/admin/users").send(payload);

    expect(response.status).toBe(400);
    expect(createResearcherWithProfile).not.toHaveBeenCalled();
  });

  it("retorna 400 para email invalido", async () => {
    const response = await publicRequest({ ...validPayload(), email: "emailinvalido" });

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
    expect(createResearcherWithProfile).not.toHaveBeenCalled();
  });

  it("retorna 400 para senha muito curta", async () => {
    const response = await publicRequest({ ...validPayload(), password: "123" });

    expect(response.status).toBe(400);
    expect(createResearcherWithProfile).not.toHaveBeenCalled();
  });

  it("retorna 409 quando o email ja existe", async () => {
    findByEmail.mockResolvedValueOnce(buildStoredUser());

    const response = await publicRequest();

    expect(response.status).toBe(409);
    expect(response.body.error).toContain("already exists");
    expect(createResearcherWithProfile).not.toHaveBeenCalled();
  });

  it("propaga falha da transacao sem responder 201", async () => {
    findByEmail.mockResolvedValueOnce(null);
    let storedPath = "";
    createResearcherWithProfile.mockImplementationOnce(async (data) => {
      storedPath = data.coep.documentStoragePath;
      throw new Error("rollback");
    });

    const response = await publicRequest();

    expect(response.status).toBe(500);
    expect(storedPath).not.toBe("");
    expect(existsSync(storedPath)).toBe(false);
  });

  it("retorna 400 quando o documento do COEP não é enviado", async () => {
    findByEmail.mockResolvedValueOnce(null);

    const response = await publicRequest(validPayload(), false);

    expect(response.status).toBe(400);
    expect(response.body.error).toContain("documento do COEP");
    expect(createResearcherWithProfile).not.toHaveBeenCalled();
  });

  it("retorna 400 quando o arquivo não é um PDF válido", async () => {
    findByEmail.mockResolvedValueOnce(null);

    const response = await request(app)
      .post("/api/admin/users")
      .field("full_name", "Teste")
      .field("email", "teste@niar.local.test")
      .field("password", "senha12345")
      .field("profile", JSON.stringify(validPayload().profile))
      .field("researcher_profile", JSON.stringify(validPayload().researcher_profile))
      .field("coep", JSON.stringify(validPayload().coep))
      .attach("coep_document", Buffer.from("não é pdf"), "parecer-coep.pdf");

    expect(response.status).toBe(400);
    expect(response.body.error).toContain("PDF válido");
    expect(createResearcherWithProfile).not.toHaveBeenCalled();
  });

  it("publica o contrato multipart no Swagger", async () => {
    const response = await request(app).get("/api/admin/docs.json");
    const requestBody = response.body.paths["/admin/users"].post.requestBody;

    expect(response.status).toBe(200);
    expect(requestBody.content["multipart/form-data"].schema.$ref).toBe("#/components/schemas/CreateUser");
    expect(response.body.components.schemas.CreateUser.properties.coep_document).toMatchObject({
      type: "string",
      format: "binary"
    });
  });
});

describe("POST /api/admin/users/internal (protegido)", () => {
  beforeEach(() => {
    findByEmail.mockReset();
    create.mockReset();
    findById.mockReset();
  });

  it("retorna 401 sem autenticação", async () => {
    const response = await request(app).post("/api/admin/users/internal").send({
      full_name: "Novo Admin",
      email: "novo-admin@niar.local",
      password: "senha12345",
      role: "admin"
    });

    expect(response.status).toBe(401);
    expect(create).not.toHaveBeenCalled();
  });

  it("researcher autenticado não consegue usar o cadastro protegido", async () => {
    findById.mockResolvedValueOnce(buildStoredUser({ id: 20, role: "researcher" }));

    const response = await request(app)
      .post("/api/admin/users/internal")
      .set("Authorization", `Bearer ${tokenFor(20)}`)
      .send({ full_name: "X", email: "x@niar.local", password: "senha12345", role: "committee" });

    expect(response.status).toBe(403);
    expect(create).not.toHaveBeenCalled();
  });

  it("committee autenticado não consegue usar o cadastro protegido", async () => {
    findById.mockResolvedValueOnce(buildStoredUser({ id: 21, role: "committee" }));

    const response = await request(app)
      .post("/api/admin/users/internal")
      .set("Authorization", `Bearer ${tokenFor(21)}`)
      .send({ full_name: "X", email: "x@niar.local", password: "senha12345", role: "researcher" });

    expect(response.status).toBe(403);
    expect(create).not.toHaveBeenCalled();
  });

  it("admin autenticado consegue criar um committee", async () => {
    findById.mockResolvedValueOnce(buildStoredUser({ id: 10, role: "admin" }));
    findByEmail.mockResolvedValueOnce(null);
    create.mockResolvedValueOnce(buildStoredUser({ id: 30, role: "committee", email: "comite@niar.local" }));

    const response = await request(app)
      .post("/api/admin/users/internal")
      .set("Authorization", `Bearer ${tokenFor(10)}`)
      .send({ full_name: "Membro do Comitê", email: "comite@niar.local", password: "senha12345", role: "committee" });

    expect(response.status).toBe(201);
    expect(response.body.role).toBe("committee");
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ role: "committee" }));
  });

  it("admin autenticado consegue criar outro admin", async () => {
    findById.mockResolvedValueOnce(buildStoredUser({ id: 10, role: "admin" }));
    findByEmail.mockResolvedValueOnce(null);
    create.mockResolvedValueOnce(buildStoredUser({ id: 31, role: "admin", email: "outro-admin@niar.local" }));

    const response = await request(app)
      .post("/api/admin/users/internal")
      .set("Authorization", `Bearer ${tokenFor(10)}`)
      .send({ full_name: "Outro Gestor", email: "outro-admin@niar.local", password: "senha12345", role: "admin" });

    expect(response.status).toBe(201);
    expect(response.body.role).toBe("admin");
  });
});
