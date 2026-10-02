import { zodResolver } from '@hookform/resolvers/zod';
import { hasAccessToRoute } from '@niar/auth';
import { APP_ROUTES, APP_TITLES } from '@niar/config';
import { Alert, Button, Icon, Input, Link as NiarLink, PageIntro } from '@niar/ui';
import { Controller, useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import './Login.css';
import { loginSchema, type LoginValues } from './Login.validators';

type SessionUser = {
  role: Parameters<typeof hasAccessToRoute>[0] extends infer Role ? Role : never;
};

type LoginPageProps = {
  onLogin: (email: string, password: string) => Promise<SessionUser>;
};

export function LoginPage({ onLogin }: LoginPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function submit({ email, password }: LoginValues) {
    try {
      const user = await onLogin(email, password);
      const requestedRoute = (location.state as { from?: string } | null)?.from;
      const redirectTo = requestedRoute && hasAccessToRoute(user.role, requestedRoute)
        ? requestedRoute
        : '/admin';
      navigate(redirectTo, { replace: true });
    } catch (loginError) {
      setError('root', {
        message: loginError instanceof Error ? loginError.message : 'Não foi possível entrar.',
      });
    }
  }

  return (
    <main className="login-page">
      <section className="login-brand-panel">
        <div className="brand-mark" aria-hidden="true" />
        <p className="brand-name">NIAR-Saúde</p>
        <p className="brand-description">Núcleo de Inteligência Artificial Responsável para a Saúde</p>
        <p className="brand-message">
          Pesquisa, inovação e responsabilidade para transformar a saúde com inteligência artificial.
        </p>
      </section>
      <section className="login-form-panel" aria-labelledby="login-title">
        <div className="login-form-content">
          <NiarLink
            className="back-to-site"
            href={APP_ROUTES.salaSegura}
            startIcon={<Icon name="arrowBack" fontSize="small" aria-hidden="true" />}
            underline="none"
          >
            Voltar para a Sala Segura
          </NiarLink>
          <PageIntro
            title={<span id="login-title">{APP_TITLES.login}</span>}
            description="Use suas credenciais para continuar."
          />
          <form className="auth-form" onSubmit={handleSubmit(submit)} noValidate>
            <Controller name="email" control={control} render={({ field }) => (
              <Input {...field} label="E-mail" type="email" autoComplete="email" error={Boolean(errors.email)} helperText={errors.email?.message} fullWidth />
            )} />
            <Controller name="password" control={control} render={({ field }) => (
              <Input {...field} label="Senha" type="password" autoComplete="current-password" error={Boolean(errors.password)} helperText={errors.password?.message} fullWidth />
            )} />
            {errors.root?.message ? <Alert severity="error">{errors.root.message}</Alert> : null}
            <Button disabled={isSubmitting} type="submit" variant="contained" color="primary" size="large">
              {isSubmitting ? 'Entrando...' : 'Entrar na plataforma'}
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
}
