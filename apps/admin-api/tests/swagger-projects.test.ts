import { describe, expect, it } from "@jest/globals";
import { swaggerSpec } from "../src/swagger.js";
import { projectEvaluationStatusSchema, projectStatusSchema } from "../src/schemas/project-schema.js";
import { updateEvaluationSchema } from "../src/schemas/evaluation-schema.js";

type Schema = { $ref?: string; enum?: string[]; required?: string[]; oneOf?: Schema[]; pattern?: string; properties?: Record<string, Schema> };
const spec = swaggerSpec as {
  components: { schemas: Record<string, Schema> };
  paths: Record<string, { get: { parameters: { name: string; schema: Schema }[] } }>;
};
const resolveSchema = (schema: Schema): Schema => schema.$ref
  ? spec.components.schemas[schema.$ref.split("/").at(-1)!]
  : schema;

describe("Swagger dos projetos", () => {
  it("documenta os mesmos status de projeto no filtro e no histórico", () => {
    const filter = spec.paths["/admin/projects"].get.parameters.find((item) => item.name === "status")!;
    const history = spec.components.schemas.ProjectStatusResponse.properties!.code;
    expect(resolveSchema(filter.schema).enum).toEqual(projectStatusSchema.options);
    expect(resolveSchema(history).enum).toEqual(projectStatusSchema.options);
  });

  it("documenta todos os estados de leitura e filtro, incluindo espera e valores históricos", () => {
    const responseSchema = resolveSchema(spec.components.schemas.ProjectResponse.properties!.evaluation_status);
    const parameter = spec.paths["/admin/projects"].get.parameters.find((item) => item.name === "evaluation_status")!;
    const filterSchema = resolveSchema(parameter.schema);
    const expected = [...projectEvaluationStatusSchema.options];
    expect(responseSchema.enum).toEqual(expected);
    expect(filterSchema.enum).toEqual(expected);
    expect(expected).toEqual(expect.arrayContaining(["waiting", "to_review", "needs_changes", "project_changes_requested"]));
    expect(resolveSchema(spec.components.schemas.ProjectEvaluationResponse.properties!.status).enum).toContain("to_review");
    expect(resolveSchema(spec.components.schemas.EvaluationResponse.properties!.status).enum).toContain("needs_changes");
  });

  it.each(["needs_changes", "approved", "rejected", "sent_to_committee", "approved_by_committee", "rejected_by_committee", "needs_changes_by_committee"])(
    "permite ler %s e rejeita seu uso em novas decisões", (status) => {
      expect(projectEvaluationStatusSchema.safeParse(status).success).toBe(true);
      expect(updateEvaluationSchema.safeParse({ status }).success).toBe(false);
    }
  );

  it("documenta os requisitos condicionais de cada decisão e do selo", () => {
    const variants = spec.components.schemas.UpdateEvaluationInput.oneOf!;
    expect(variants).toHaveLength(6);
    for (const variant of variants) {
      const status = variant.properties!.status.enum![0];
      expect(variant.required).toContain("status");
      expect(variant.required?.includes("evaluation_id")).toBe(status.startsWith("report_"));
      const requiresReason = status.endsWith("rejected") || status.endsWith("changes_requested");
      expect(variant.required?.includes("justification")).toBe(requiresReason);
      if (requiresReason) {
        const pattern = new RegExp(variant.properties!.justification.pattern!);
        expect(pattern.test("Parecer humano")).toBe(true);
        expect(pattern.test("  \n")).toBe(false);
      }
      if (status === "report_approved") {
        expect(variant.required).toContain("certification_decision");
        const denied = variant.oneOf!.find((item) => item.properties!.certification_decision.enum![0] === "not_granted")!;
        expect(denied.required).toContain("certification_reason");
        expect(new RegExp(denied.properties!.certification_reason.pattern!).test("Motivo da decisão")).toBe(true);
        expect(new RegExp(denied.properties!.certification_reason.pattern!).test("   ")).toBe(false);
      }
    }
  });

  it.each([
    { status: "report_approved", certification_decision: "granted" },
    { status: "report_approved", evaluation_id: 1 },
    { status: "report_approved", evaluation_id: 1, certification_decision: "not_granted", certification_reason: "  " },
    { status: "report_rejected", evaluation_id: 1, justification: "  " },
    { status: "project_changes_requested" },
    { status: "project_approved", certification_decision: "granted" },
  ])("rejeita decisão incompleta ou incompatível: %j", (payload) => {
    expect(updateEvaluationSchema.safeParse(payload).success).toBe(false);
  });

  it.each([
    { status: "project_approved" },
    { status: "project_changes_requested", justification: "Rever métodos" },
    { status: "report_changes_requested", evaluation_id: 1, justification: "Rever relatório" },
    { status: "report_approved", evaluation_id: 1, certification_decision: "granted" },
    { status: "report_approved", evaluation_id: 1, certification_decision: "not_granted", certification_reason: "Requisitos do selo não atendidos" },
  ])("aceita decisão completa: %j", (payload) => {
    expect(updateEvaluationSchema.safeParse(payload).success).toBe(true);
  });
});
