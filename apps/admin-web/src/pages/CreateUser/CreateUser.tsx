import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Autocomplete, Form, Icon, Link } from '@niar/ui';
import type { UserRole } from '../../types/user.types';
import { ResearcherCreateForm } from './forms/ResearcherCreateForm';
import { AdministratorCreateForm } from './forms/AdministratorCreateForm';
import { AuditorCreateForm } from './forms/AuditorCreateForm';
import { CommitteeCreateForm } from './forms/CommitteeCreateForm';
import './CreateUser.scss';

const ROLE_OPTIONS: { label: string; value: UserRole }[] = [
  { label: 'Pesquisador', value: 'researcher' },
  { label: 'Administrador', value: 'admin' },
  { label: 'Auditor', value: 'auditor' },
  { label: 'Membro do Comitê', value: 'committee' },
];

export function CreateUser() {
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>('researcher');

  const selectedOption = ROLE_OPTIONS.find((o) => o.value === role) ?? ROLE_OPTIONS[0];

  const descriptions = {
    'admin': 'Adicione um novo usuário administrador à plataforma.',
    'auditor': 'Adicione um novo usuário auditor do NIAR à plataforma.',
    'committee': 'Adicione um novo membro do comissão à plataforma.',
    'researcher': 'Preencha os dados abaixo para criar o acesso e registrar o parecer do COEP',
  };

  return (
    <div className="create-user-page">
      <Form
        title="Cadastrar usuário"
        description={descriptions[role]}
        aria-level={1}
      >
        <div className="create-user-page__body">
          <Autocomplete
            label="Perfil"
            options={ROLE_OPTIONS}
            value={selectedOption}
            onChange={(_event, option) => {
              const next = option as { label: string; value: UserRole } | null;
              if (next) setRole(next.value);
            }}
          />

          {role === 'researcher' && <ResearcherCreateForm/>}
          {role === 'admin' && <AdministratorCreateForm/>}
          {role === 'auditor' && <AuditorCreateForm/>}
          {role === 'committee' && <CommitteeCreateForm/>}
        </div>
      </Form>
    </div>
  );
}
