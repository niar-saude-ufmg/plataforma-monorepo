import { useState } from 'react';
import type { FormEvent } from 'react';
import { useCreateUser } from '../hooks/use-users';
import type { ApiError, CreateUserInput, User } from '../types/user';

/**
 * Formulário de cadastro de pesquisador.
 *
 * Atualização de escopo: o perfil NÃO aparece na tela — todo cadastro feito
 * aqui envia `role: "researcher"` internamente. O seletor de perfil volta na
 * tarefa da gestão administrativa de usuários.
 */

type FormState = {
  fullName: string;
  email: string;
  password: string;
  passwordConfirmation: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;
type TouchedFields = Partial<Record<keyof FormState, boolean>>;

const INITIAL_STATE: FormState = {
  fullName: '',
  email: '',
  password: '',
  passwordConfirmation: '',
};

const MIN_PASSWORD_LENGTH = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Validação local: evita ida desnecessária ao servidor. O backend continua sendo a fonte da verdade. */
function validate(values: FormState): FieldErrors {
  const errors: FieldErrors = {};

  if (values.fullName.trim().length < 3) {
    errors.fullName = 'Informe o nome completo do pesquisador.';
  }
  if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Informe um e-mail válido, como nome@instituicao.org.';
  }
  if (values.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `A senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }
  if (values.passwordConfirmation.length < MIN_PASSWORD_LENGTH) {
    errors.passwordConfirmation = `A confirmação de senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  } else if (values.password !== values.passwordConfirmation) {
    errors.passwordConfirmation = 'A confirmação de senha deve ser igual à senha informada.';
  }

  return errors;
}

function getFieldError(field: keyof FormState, values: FormState) {
  return validate(values)[field];
}

function isApiError(value: unknown): value is ApiError {
  return typeof value === 'object' && value !== null && 'message' in value;
}

interface UserFormProps {
  /** Disparado depois que a API confirma a criação. */
  onCreated?: (user: User) => void;
}

export function UserForm({ onCreated }: UserFormProps) {
  const [values, setValues] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touchedFields, setTouchedFields] = useState<TouchedFields>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

  const { mutateAsync, isPending } = useCreateUser();

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setValues((current) => {
      const nextValues = { ...current, [field]: value };
      setErrors((currentErrors) => {
        const nextErrors = { ...currentErrors, [field]: undefined };

        if (touchedFields[field]) {
          nextErrors[field] = getFieldError(field, nextValues);
        }

        if (field === 'password' && touchedFields.passwordConfirmation) {
          nextErrors.passwordConfirmation = getFieldError('passwordConfirmation', nextValues);
        }

        return nextErrors;
      });

      return nextValues;
    });
    setFormError(null);
    setSuccessMessage(null);
  }

  function handleBlur(field: keyof FormState) {
    setTouchedFields((current) => ({ ...current, [field]: true }));
    setErrors((current) => ({ ...current, [field]: getFieldError(field, values) }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Trava extra contra duplo envio (o botão já fica disabled).
    if (isPending) return;

    const validationErrors = validate(values);
    if (Object.keys(validationErrors).length > 0) {
      setTouchedFields({
        fullName: true,
        email: true,
        password: true,
        passwordConfirmation: true,
      });
      setErrors(validationErrors);
      return;
    }

    const payload: CreateUserInput = {
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      password: values.password,
      // Escopo atual: todo cadastro desta tela é de pesquisador.
      role: 'researcher',
    };

    try {
      const created = await mutateAsync(payload);
      setValues(INITIAL_STATE);
      setErrors({});
      setTouchedFields({});
      setSuccessMessage(`${created.fullName} foi cadastrado(a) como pesquisador(a).`);
      onCreated?.(created);
    } catch (error) {
      // Erros de campo vindos do backend aparecem embaixo do campo certo.
      if (isApiError(error)) {
        if (error.fieldErrors) {
          setErrors((current) => ({ ...current, ...error.fieldErrors }));
        }
        setFormError(error.message);
      } else {
        setFormError('Não foi possível cadastrar o pesquisador. Tente novamente.');
      }
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {formError ? (
        <p className="alert alert--error" role="alert">
          {formError}
        </p>
      ) : null}

      {successMessage ? (
        <p className="alert alert--success" role="status">
          {successMessage}
        </p>
      ) : null}

      <div className="field">
        <label className="field__label" htmlFor="fullName">
          Nome completo
        </label>
        <input
          id="fullName"
          name="fullName"
          className="field__control"
          type="text"
          autoComplete="name"
          placeholder="Ex.: Ana Beatriz Souza"
          value={values.fullName}
          onChange={(event) => updateField('fullName', event.target.value)}
          onBlur={() => handleBlur('fullName')}
          aria-invalid={Boolean(errors.fullName)}
          aria-describedby={errors.fullName ? 'fullName-error' : undefined}
        />
        {errors.fullName ? (
          <span className="field__error" id="fullName-error" role="alert">
            {errors.fullName}
          </span>
        ) : null}
      </div>

      <div className="field">
        <label className="field__label" htmlFor="email">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          className="field__control"
          type="email"
          autoComplete="email"
          placeholder="nome@niar-saude.org"
          value={values.email}
          onChange={(event) => updateField('email', event.target.value)}
          onBlur={() => handleBlur('email')}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email ? (
          <span className="field__error" id="email-error" role="alert">
            {errors.email}
          </span>
        ) : null}
      </div>

      <div className="field field--password">
        <label className="field__label" htmlFor="password">
          Senha
        </label>
        <input
          id="password"
          name="password"
          className="field__control"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Mínimo de 8 caracteres"
          value={values.password}
          onChange={(event) => updateField('password', event.target.value)}
          onBlur={() => handleBlur('password')}
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? 'password-error' : undefined}
        />
        <button
          type="button"
          className="field__toggle"
          onClick={() => setShowPassword((current) => !current)}
          aria-pressed={showPassword}
        >
          {showPassword ? 'Ocultar' : 'Mostrar'}
        </button>
        {errors.password ? (
          <span className="field__error" id="password-error" role="alert">
            {errors.password}
          </span>
        ) : null}
      </div>

      <div className="field field--password">
        <label className="field__label" htmlFor="passwordConfirmation">
          Repetir senha
        </label>
        <input
          id="passwordConfirmation"
          name="passwordConfirmation"
          className="field__control"
          type={showPasswordConfirmation ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Repita a senha informada"
          value={values.passwordConfirmation}
          onChange={(event) => updateField('passwordConfirmation', event.target.value)}
          onBlur={() => handleBlur('passwordConfirmation')}
          aria-invalid={Boolean(errors.passwordConfirmation)}
          aria-describedby={errors.passwordConfirmation ? 'password-confirmation-error' : undefined}
        />
        <button
          type="button"
          className="field__toggle"
          onClick={() => setShowPasswordConfirmation((current) => !current)}
          aria-pressed={showPasswordConfirmation}
        >
          {showPasswordConfirmation ? 'Ocultar' : 'Mostrar'}
        </button>
        {errors.passwordConfirmation ? (
          <span className="field__error" id="password-confirmation-error" role="alert">
            {errors.passwordConfirmation}
          </span>
        ) : null}
      </div>

      <button type="submit" className="btn btn--primary" disabled={isPending}>
        {isPending ? 'Cadastrando…' : 'Cadastrar pesquisador'}
      </button>
    </form>
  );
}
