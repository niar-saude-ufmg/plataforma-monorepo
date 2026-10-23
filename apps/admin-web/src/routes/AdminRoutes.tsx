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
import { Users } from "../pages/Users/Users";
import { useAppSelector } from "../store/hooks";
import { selectAuthSelected } from "../store/auth/auth.selectors";
import {
  getRoleHomePath,
  getRoleRouteDefinitions,
  getRoleRoutePath,
} from "./role-routes";

function RoleRouteContent({
  user,
}: {
  user: NonNullable<ReturnType<typeof selectAuthSelected>>;
}) {
  const location = useLocation();
  const route = getRoleRouteDefinitions(user.role).find(
    ({ section }) => location.pathname === getRoleRoutePath(user.role, section),
  );

  if (!route) return <Navigate replace to={getRoleHomePath(user.role)} />;

  // Workaround temporário: comitê e auditor ainda não possuem página de perfil.
  const profilePage =
    user.role === "admin" || user.role === "researcher"
      ? <Profile role={user.role} />
      : <Navigate replace to={getRoleHomePath(user.role)} />;

  const page =
    route.section === "projetos" ? <Projects /> :
    route.section === "usuarios" ? <Users /> :
    route.section === "especialidades" ? <Specialties /> :
    route.section === "perfil" ? profilePage :
    <RoleHome section={route.section} userName={user.name} />;
  const allowedRoles =
    route.section === "projetos"
      ? (["admin", "researcher"] as const)
      : route.section === "perfil"
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
