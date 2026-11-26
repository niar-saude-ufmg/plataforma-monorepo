import { describe, expect, it } from 'vitest';
import { resetAssistantStore } from './session/session.actions';
import { rootReducer } from './index';
import { setSelectedProject } from './projects/projects.slice';
import type { WizardSession } from '../types/assistant.types';

const project: WizardSession = {
  id: 1,
  wizard_type: 'project_doc',
  current_step: 'start',
  title: 'Projeto',
  dataset_id: null,
  linked_project_id: null,
  section_data: {},
  script_content: '',
  validation_result: {},
  quality_checklist: {},
  llm_model_used: '',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  messages: [],
};

describe('assistant root reducer', () => {
  it('limpa os dados dos slices ao trocar ou encerrar a sessão', () => {
    const state = rootReducer(undefined, setSelectedProject(project));
    const reset = rootReducer(state, resetAssistantStore());

    expect(reset.projects.selected).toBeNull();
    expect(reset.projects.items).toEqual([]);
    expect(reset.cleaning.selected).toBeNull();
  });
});
