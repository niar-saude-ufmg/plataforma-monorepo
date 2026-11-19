import { useEffect, useState } from 'react';
import { errorMessage } from '../services/http';
import { getAudit } from '../store/audit/audit.api';
import { selectAudit } from '../store/audit/audit.selectors';
import {
  createDataset, createDatasetTable, createTableColumn, deleteDataset,
  deleteTableColumn, getAdminDatasets, getDatasetTables,
} from '../store/datasets/datasets.api';
import { selectAdminDatasets, selectDatasetTables } from '../store/datasets/datasets.selectors';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getSettings, updateSetting } from '../store/settings/settings.api';
import { selectSettings } from '../store/settings/settings.selectors';
import { createUser as createAdminUser, getUsers } from '../store/users/users.api';
import { selectUsers, selectUsersMutation } from '../store/users/users.selectors';

export default function AdminPage() {
  const dispatch = useAppDispatch();
  const datasets = useAppSelector(selectAdminDatasets);
  const settings = useAppSelector(selectSettings);
  const audit = useAppSelector(selectAudit);
  const users = useAppSelector(selectUsers);
  const tables = useAppSelector(selectDatasetTables);
  const userMutation = useAppSelector(selectUsersMutation);
  const [selectedDataset, setSelectedDataset] = useState<number | null>(null);
  const [newDataset, setNewDataset] = useState({ name: '', description: '' });
  const [newTable, setNewTable] = useState({ name: '', description: '' });
  const [newColumn, setNewColumn] = useState({ tableId: 0, name: '', data_type: 'VARCHAR(255)', description: '' });
  const [newUser, setNewUser] = useState({
    email: '',
    full_name: '',
    password: '',
    role: 'researcher',
  });
  const [userMessage, setUserMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    try {
      await Promise.all([
        dispatch(getAdminDatasets()).unwrap(),
        dispatch(getSettings()).unwrap(),
        dispatch(getAudit()).unwrap(),
        dispatch(getUsers()).unwrap(),
      ]);
    } catch (e) {
      setError(errorMessage(e, 'Falha ao carregar dados de administração'));
    }
  };

  useEffect(() => { load(); }, []);

  const loadTables = async (datasetId: number) => {
    setSelectedDataset(datasetId);
    await dispatch(getDatasetTables(datasetId)).unwrap();
  };

  const createUser = async () => {
    setError('');
    setUserMessage('');
    if (!newUser.email.trim() || !newUser.full_name.trim() || newUser.password.length < 8) {
      setError('Preencha nome, e-mail e senha (mínimo 8 caracteres).');
      return;
    }
    try {
      await dispatch(createAdminUser({
        email: newUser.email.trim(),
        full_name: newUser.full_name.trim(),
        password: newUser.password,
        role: newUser.role,
      })).unwrap();
      setNewUser({ email: '', full_name: '', password: '', role: 'researcher' });
      setUserMessage('Usuário criado com sucesso.');
      await load();
    } catch (e) {
      setError(errorMessage(e, 'Falha ao criar usuário'));
    }
  };

  const roleLabel = (role: string) => (role === 'admin' ? 'Administrador' : 'Pesquisador');

  return (
    <div className="page admin-page">
      <header className="page-intro">
        <h1>Administração</h1>
        <p className="muted">Usuários, catálogo de metadados e configurações do sistema.</p>
      </header>
      {error && <p className="error">{error}</p>}
      {userMessage && <p className="save-message">{userMessage}</p>}

      <section className="admin-section">
        <h2>Usuários</h2>
        <div className="inline-form">
          <input
            placeholder="Nome completo"
            value={newUser.full_name}
            onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
          />
          <input
            type="email"
            placeholder="E-mail"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Senha (mín. 8)"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          />
          <select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            aria-label="Papel do usuário"
          >
            <option value="researcher">Pesquisador</option>
            <option value="admin">Administrador</option>
          </select>
          <button type="button" onClick={createUser} disabled={userMutation.status === 'pending'}>
            {userMutation.status === 'pending' ? 'Criando…' : 'Criar usuário'}
          </button>
        </div>
        <table className="schema-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Papel</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.full_name}</td>
                <td>{u.email}</td>
                <td>{roleLabel(u.role)}</td>
                <td>{u.account_status}</td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="muted">Nenhum usuário cadastrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="admin-section">
        <h2>Configurações do App</h2>
        <table className="schema-table">
          <thead><tr><th>Chave</th><th>Valor</th><th></th></tr></thead>
          <tbody>
            {settings.map((s) => (
              <tr key={s.key}>
                <td>{s.key}</td>
                <td>
                  <input
                    defaultValue={s.value}
                    onBlur={async (e) => {
                      await dispatch(updateSetting({ key: s.key, value: e.target.value })).unwrap();
                      load();
                    }}
                  />
                </td>
                <td><small>saia do campo para salvar</small></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="admin-section">
        <h2>Conjuntos de Dados</h2>
        <div className="inline-form">
          <input placeholder="Nome" value={newDataset.name} onChange={(e) => setNewDataset({ ...newDataset, name: e.target.value })} />
          <input placeholder="Descrição" value={newDataset.description} onChange={(e) => setNewDataset({ ...newDataset, description: e.target.value })} />
          <button onClick={async () => {
            await dispatch(createDataset({ ...newDataset, enabled: true })).unwrap();
            setNewDataset({ name: '', description: '' });
            load();
          }}>Adicionar Conjunto</button>
        </div>
        <ul>
          {datasets.map((d) => (
            <li key={d.id}>
              <button onClick={() => loadTables(d.id)}>{d.name}</button>
              {d.enabled ? ' (ativo)' : ' (inativo)'}
              <button className="btn danger small" onClick={async () => { await dispatch(deleteDataset(d.id)).unwrap(); await load(); }}>Excluir</button>
            </li>
          ))}
        </ul>
      </section>

      {selectedDataset && (
        <section className="admin-section">
          <h2>Tabelas do Conjunto #{selectedDataset}</h2>
          <div className="inline-form">
            <input placeholder="Nome da tabela" value={newTable.name} onChange={(e) => setNewTable({ ...newTable, name: e.target.value })} />
            <input placeholder="Descrição" value={newTable.description} onChange={(e) => setNewTable({ ...newTable, description: e.target.value })} />
            <button onClick={async () => {
              await dispatch(createDatasetTable({ datasetId: selectedDataset, data: newTable })).unwrap();
              setNewTable({ name: '', description: '' });
              loadTables(selectedDataset);
            }}>Adicionar Tabela</button>
          </div>
          {tables.map((t) => (
            <details key={t.id as number}>
              <summary>{t.name as string}</summary>
              <p>{t.description as string}</p>
              <table className="schema-table">
                <thead><tr><th>Coluna</th><th>Tipo</th><th>Descrição</th><th></th></tr></thead>
                <tbody>
                  {((t.columns as Array<Record<string, unknown>>) || []).map((c) => (
                    <tr key={c.id as number}>
                      <td>{c.name as string}</td>
                      <td>{c.data_type as string}</td>
                      <td>{c.description as string}</td>
                      <td><button className="btn danger small" onClick={async () => {
                        await dispatch(deleteTableColumn(c.id as number)).unwrap();
                        loadTables(selectedDataset);
                      }}>Excluir</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="inline-form">
                <input placeholder="Nome da coluna" onChange={(e) => setNewColumn({ ...newColumn, tableId: t.id as number, name: e.target.value })} />
                <input placeholder="Tipo" value={newColumn.data_type} onChange={(e) => setNewColumn({ ...newColumn, data_type: e.target.value })} />
                <input placeholder="Descrição" onChange={(e) => setNewColumn({ ...newColumn, tableId: t.id as number, description: e.target.value })} />
                <button onClick={async () => {
                  await dispatch(createTableColumn({ tableId: newColumn.tableId, data: {
                    name: newColumn.name,
                    data_type: newColumn.data_type,
                    description: newColumn.description,
                  } })).unwrap();
                  loadTables(selectedDataset);
                }}>Adicionar Coluna</button>
              </div>
            </details>
          ))}
        </section>
      )}

      <section className="admin-section">
        <h2>Registro de Auditoria (recentes)</h2>
        <table className="schema-table">
          <thead><tr><th>Horário</th><th>Usuário</th><th>Ação</th><th>Recurso</th></tr></thead>
          <tbody>
            {audit.slice(0, 50).map((log) => (
              <tr key={log.id as number}>
                <td>{String(log.created_at)}</td>
                <td>{String(log.user_id)}</td>
                <td>{String(log.action)}</td>
                <td>{String(log.resource_type)} {String(log.resource_id)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
