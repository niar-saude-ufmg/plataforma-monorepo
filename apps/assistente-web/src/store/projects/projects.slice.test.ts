import { describe, expect, it } from 'vitest';
import type { WizardSession } from '../../types/assistant.types';
import { getProject, getProjectCleaning, getProjects } from './projects.api';
import reducer, { setLinkedCleaning, setSelectedProject } from './projects.slice';

function session(id = 1): WizardSession {
  return {
    id,
    wizard_type: 'project_doc',
    current_step: 'start',
    title: `Projeto ${id}`,
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
}

describe('projects slice', () => {
  it('armazena a listagem e seu estado assíncrono', () => {
    const pending = reducer(undefined, getProjects.pending('request', undefined));
    expect(pending.list).toMatchObject({ status: 'pending', error: null });

    const project = session();
    const fulfilled = reducer(pending, getProjects.fulfilled([project], 'request', undefined));
    expect(fulfilled.items).toEqual([project]);
    expect(fulfilled.list.status).toBe('succeeded');
  });

  it('mantém o erro normalizado quando a listagem falha', () => {
    const state = reducer(
      undefined,
      getProjects.rejected(new Error('erro'), 'request', undefined, { message: 'API indisponível', status: 503 }),
    );

    expect(state.list.status).toBe('failed');
    expect(state.list.error).toEqual({ message: 'API indisponível', status: 503 });
  });

  it('armazena o projeto e a engenharia de dados selecionados', () => {
    const project = session(10);
    const cleaning = { ...session(20), wizard_type: 'data_clean', linked_project_id: 10 };
    let state = reducer(undefined, getProject.fulfilled(project, 'project', project.id));
    state = reducer(state, getProjectCleaning.fulfilled(cleaning, 'cleaning', project.id));

    expect(state.selected).toEqual(project);
    expect(state.linkedCleaning).toEqual(cleaning);
  });

  it('permite atualizações otimistas e limpeza das seleções', () => {
    const project = session();
    let state = reducer(undefined, setSelectedProject(project));
    state = reducer(state, setLinkedCleaning({ ...project, wizard_type: 'data_clean' }));
    state = reducer(state, setSelectedProject(null));
    state = reducer(state, setLinkedCleaning(null));

    expect(state.selected).toBeNull();
    expect(state.linkedCleaning).toBeNull();
  });
});
