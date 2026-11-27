import { clearPlatformSession } from "@niar/auth";
import { APP_ROUTES } from "@niar/config";
import { Button, PageContainer } from "@niar/ui";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { getRoleNavigation } from "../../routes/role-routes";
import { selectAuthSelected } from "../../store/auth/auth.selectors";
import { clearSelectedAuthUser } from "../../store/auth/auth.slice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthSelected);

  if (!user) return null;

  const navigation = getRoleNavigation(user.role);
  const activeItem = navigation.find(({ path }) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`),
  )?.path ?? navigation[0]?.path;

  const handleLogout = () => {
    clearPlatformSession();
    dispatch(clearSelectedAuthUser());
    navigate("/login", { replace: true });
  };

  return (
    <PageContainer
      tabs={navigation.map(({ label, path }) => ({ label, value: path }))}
      activeItem={activeItem}
      onItemChange={(path) => navigate(path)}
      showAvatar={false}
      actions={
        <>
          {user.role === "researcher" && (
            <Button variant="outlined" color="secondary" size="small" href={APP_ROUTES.assistant}>
              Assistente
            </Button>
          )}
          <Button variant="outlined" size="small" onClick={handleLogout}>
            Sair
          </Button>
        </>
      }
    >
      <Outlet />
    </PageContainer>
  );
}
