import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useInRouterContext,
  useLocation,
} from "react-router-dom";
import { RoleGuard } from "../guards/RoleGuard";
import { AdminLayout } from "../layouts/AdminLayout/AdminLayout";
import { Projects } from "../pages/Projects/Projects";
import { Profile } from "../pages/Profile/Profile";
import { RoleHome } from "../pages/RoleHome/RoleHome";
import { Specialties } from "../pages/Specialties/Specialties";
import { Specialty } from "../pages/Specialty/Specialty";
import { Users } from "../pages/Users/Users";
import { CreateUser } from "../pages/CreateUser/CreateUser";
import { useAppSelector } from "../store/hooks";
import { selectAuthSelected } from "../store/auth/auth.selectors";
import {
  getRoleHomePath,
  getRoleRouteDefinitions,
  getRoleRoutePath,
  getSpecialtyCreatePath,
  getSpecialtyEditPath,
} from "./role-routes";

function RoleRouteContent({
  user,
}: {
  user: NonNullable<ReturnType<typeof selectAuthSelected>>;
}) {
  const location = useLocation();
  const specialtyFormPath = [getSpecialtyCreatePath(user.role), getSpecialtyEditPath(user.role)]
    .includes(location.pathname);
  const route = getRoleRouteDefinitions(user.role).find(
    ({ section }) => location.pathname === getRoleRoutePath(user.role, section),
  ) ?? (specialtyFormPath
    ? getRoleRouteDefinitions(user.role).find(({ section }) => section === "especialidades")
    : undefined);

  if (!route) return <Navigate replace to={getRoleHomePath(user.role)} />;

  // Workaround temporário: comitê e auditor ainda não possuem página de perfil.
  const profilePage =
    user.role === "admin" || user.role === "researcher"
      ? <Profile role={user.role} />
      : <Navigate replace to={getRoleHomePath(user.role)} />;

  const page =
    route.section === "projetos" ? <Projects /> :
    route.section === "usuarios" ? <Users /> :
    route.section === "especialidades"
      ? specialtyFormPath ? <Specialty /> : <Specialties />
      :
    route.section === "usuarios/novo" ? <CreateUser /> :
    route.section === "perfil" ? profilePage :
    <RoleHome section={route.section} userName={user.name} />;
  const allowedRoles =
    route.section === "projetos"
      ? (["admin", "researcher"] as const)
      : route.section === "perfil"
      ? (["admin", "researcher"] as const)
      : route.section === "usuarios" || route.section === "usuarios/novo"
      ? (["admin", "researcher"] as const)
      : ([user.role] as const);

  return <RoleGuard allowedRoles={allowedRoles}>{page}</RoleGuard>;
}

function RoleRoutes() {
  const user = useAppSelector(selectAuthSelected);

  if (!user) return <Navigate replace to="/login" />;

  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="*" element={<RoleRouteContent user={user} />} />
      </Route>
    </Routes>
  );
}

export function AdminRoutes() {
  const inRouterContext = useInRouterContext();

  if (inRouterContext) return <RoleRoutes />;

  return (
    <BrowserRouter>
      <RoleRoutes />
    </BrowserRouter>
  );
}
