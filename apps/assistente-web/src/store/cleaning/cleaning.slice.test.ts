import { describe, expect, it } from 'vitest';
import type { CleaningVersion, WizardSession } from '../../types/assistant.types';
import { getCleaning, getCleaningList, getCleaningVersions, updateCleaning } from './cleaning.api';
import reducer, { setSelectedCleaning } from './cleaning.slice';

function session(id = 1): WizardSession {
  return {
    id,
    wizard_type: 'data_clean',
    current_step: 'select_dataset',
    title: `Limpeza ${id}`,
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

describe('cleaning slice', () => {
  it('armazena a listagem e a sessão selecionada', () => {
    const cleaning = session();
    let state = reducer(undefined, getCleaningList.fulfilled([cleaning], 'list', undefined));
    state = reducer(state, getCleaning.fulfilled(cleaning, 'get', cleaning.id));

    expect(state.items).toEqual([cleaning]);
    expect(state.list.status).toBe('succeeded');
    expect(state.selected).toEqual(cleaning);
  });

  it('armazena o histórico de versões', () => {
    const version: CleaningVersion = {
      id: 2,
      session_id: 1,
      version_number: 1,
      label: 'Inicial',
      script_content: 'print("ok")',
      validation_result: {},
      messages_snapshot: [],
      notes: '',
      created_at: '2026-01-01T00:00:00Z',
    };
    const state = reducer(undefined, getCleaningVersions.fulfilled([version], 'versions', 1));

    expect(state.versions).toEqual([version]);
  });

  it('mantém o erro normalizado da operação assíncrona', () => {
    const argument = { id: 1, data: { title: 'Atualizado' } };
    const state = reducer(
      undefined,
      updateCleaning.rejected(new Error('erro'), 'update', argument, { message: 'Não autorizado', status: 401 }),
    );

    expect(state.operations.save.status).toBe('failed');
    expect(state.operations.save.error).toEqual({ message: 'Não autorizado', status: 401 });
  });

  it('permite atualizar e limpar a seleção local', () => {
    let state = reducer(undefined, setSelectedCleaning(session()));
    state = reducer(state, setSelectedCleaning(null));

    expect(state.selected).toBeNull();
  });
});
