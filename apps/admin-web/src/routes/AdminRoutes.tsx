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
import { RoleHome } from "../pages/RoleHome/RoleHome";
import { useAppSelector } from "../store/hooks";
import { selectAuthUser } from "../store/auth/auth.slice";
import {
  getRoleHomePath,
  getRoleRouteDefinitions,
  getRoleRoutePath,
} from "./role-routes";

function RoleRouteContent({
  user,
}: {
  user: NonNullable<ReturnType<typeof selectAuthUser>>;
}) {
  const location = useLocation();
  const route = getRoleRouteDefinitions(user.role).find(
    ({ section }) => location.pathname === getRoleRoutePath(user.role, section),
  );

  if (!route) return <Navigate replace to={getRoleHomePath(user.role)} />;

  const page =
    route.section === "projetos" ? (
      <Projects />
    ) : (
      <RoleHome section={route.section} userName={user.name} />
    );
  const allowedRoles =
    route.section === "projetos"
      ? (["admin", "researcher"] as const)
      : ([user.role] as const);

  return <RoleGuard allowedRoles={allowedRoles}>{page}</RoleGuard>;
}

function RoleRoutes() {
  const user = useAppSelector(selectAuthUser);

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
