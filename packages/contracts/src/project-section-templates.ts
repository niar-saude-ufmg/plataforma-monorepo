export type ProjectSection = {
  key: string;
  label: string;
  guidance: string[];
  prompt?: string;
  required: boolean;
};

export type ProjectSectionTemplateDefinition = {
  schema_version: number;
  sections: ProjectSection[];
};

export type CreateProjectSectionTemplateInput = {
  template_key: string;
  name: string;
  definition_json: ProjectSectionTemplateDefinition;
};

export type UpdateProjectSectionTemplateInput = Pick<
  CreateProjectSectionTemplateInput,
  "name" | "definition_json"
>;

export type ProjectSectionTemplateResponse = {
  id: number;
  template_key: string;
  name: string;
  version: number;
  definition_json: ProjectSectionTemplateDefinition;
  is_active: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectSectionTemplatesListResponse = {
  items: ProjectSectionTemplateResponse[];
  pagination: { page: number; page_size: number; total_items: number; total_pages: number };
};
