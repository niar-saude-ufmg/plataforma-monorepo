import {
  BrowserRouter,
  Navigate,
  useInRouterContext,
  useParams,
  useRoutes,
} from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import { RoleGuard } from "../guards/RoleGuard";
import { AdminLayout } from "../layouts/AdminLayout/AdminLayout";
import { Profile } from "../pages/Profile/Profile";
import { Projects } from "../pages/Projects/Projects";
import { RoleHome } from "../pages/RoleHome/RoleHome";
import { Specialties } from "../pages/Specialties/Specialties";
import { Specialty } from "../pages/Specialty/Specialty";
import { User } from "../pages/User/User";
import { Users } from "../pages/Users/Users";
import { useAppSelector } from "../store/hooks";
import { selectAuthSelected } from "../store/auth/auth.selectors";
import { getRoleHomePath } from "./role-routes";

function CurrentRoleRedirect() {
  const user = useAppSelector(selectAuthSelected);

  return <Navigate replace to={user ? getRoleHomePath(user.role) : "/login"} />;
}

function SpecialtyRoute() {
  const { mode } = useParams();

  return mode === "novo" || mode === "editar"
    ? <Specialty />
    : <Navigate replace to=".." />;
}

export const ADMIN_ROUTES: RouteObject[] = [
  {
    id: "admin",
    path: "/admin/:role",
    element: (
      <RoleGuard>
        <AdminLayout />
      </RoleGuard>
    ),
    children: [
      {
        id: "admin:home",
        path: "home",
        element: <RoleHome />,
      },
      {
        id: "admin:projetos",
        path: "projetos",
        element: <Projects />,
      },
      {
        id: "admin:usuarios",
        path: "usuarios",
        children: [
          {
            index: true,
            id: "admin:usuarios:index",
            element: <Users />,
          },
          {
            id: "admin:usuarios:novo",
            path: "novo",
            element: (
              <RoleGuard allowedRoles={["admin"]}>
                <User />
              </RoleGuard>
            ),
          },
        ],
      },
      {
        id: "admin:especialidades",
        path: "especialidades",
        children: [
          {
            index: true,
            id: "admin:especialidades:index",
            element: <Specialties />,
          },
          {
            id: "admin:especialidades:form",
            path: ":mode",
            element: <SpecialtyRoute />,
          },
        ],
      },
      {
        id: "admin:perfil",
        path: "perfil",
        element: <Profile />,
      },
      {
        path: "*",
        element: <CurrentRoleRedirect />,
      },
    ],
  },
  {
    path: "*",
    element: <CurrentRoleRedirect />,
  },
];

function RoleRoutes() {
  return useRoutes(ADMIN_ROUTES);
}

export function AdminRoutes() {
  const inRouterContext = useInRouterContext();

  return inRouterContext ? <RoleRoutes /> : (
    <BrowserRouter>
      <RoleRoutes />
    </BrowserRouter>
  );
}
