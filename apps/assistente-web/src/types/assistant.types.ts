export type AssistantMessage = {
  id: number;
  role: string;
  content: string;
  created_at: string;
  channel?: string;
  section_key?: string | null;
};

export type SectionData = Record<string, unknown>;

export interface WizardSession {
  id: number;
  wizard_type: string;
  current_step: string;
  title: string;
  dataset_id: number | null;
  linked_project_id: number | null;
  section_data: SectionData;
  script_content: string;
  validation_result: Record<string, unknown>;
  quality_checklist: {
    items?: Array<{
      id?: string;
      item: string;
      passed: boolean;
      note: string;
      step?: string;
    }>;
  };
  llm_model_used: string;
  created_at: string;
  updated_at: string;
  messages: AssistantMessage[];
  linked_cleaning_step?: string | null;
}

export type CleaningVersion = {
  id: number;
  session_id: number;
  version_number: number;
  label: string;
  script_content: string;
  validation_result: Record<string, unknown>;
  messages_snapshot: Array<{ role: string; content: string }>;
  notes: string;
  created_at: string;
};

export type DatasetSummary = {
  id: number;
  name: string;
  description: string;
};

export type AdminDataset = DatasetSummary & { enabled: boolean };
export type Setting = { key: string; value: string };
export type AuditEntry = Record<string, unknown>;
export type AdminUser = {
  id: number;
  email: string;
  full_name: string;
  role: string;
  account_status: string;
};

export type DownloadedFile = { blob: Blob; filename: string };
