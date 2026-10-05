import "./RoleHome.scss";

type RoleHomeProps = {
  section: "home" | "projetos";
  userName: string;
};

export function RoleHome({ section, userName }: RoleHomeProps) {
  if (section !== "home") return null;

  return (
    <section className="role-home" aria-labelledby="role-home-title">
      <span className="role-home__mark" aria-hidden="true" />
      <div className="role-home__content">
        <h1 id="role-home-title" className="role-home__title">
          Boas vindas, {userName}.
        </h1>
        <p className="role-home__description">
          Boas-vindas à plataforma de integração do NIAR-Saúde. Aqui você poderá
          acessar as funcionalidades disponíveis para o seu perfil, acompanhar as
          etapas dos projetos de pesquisa e consultar as informações relacionadas
          ao fluxo de submissão, avaliação e acompanhamento na plataforma.
        </p>
      </div>
    </section>
  );
}
