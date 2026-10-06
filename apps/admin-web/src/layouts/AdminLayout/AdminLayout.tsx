import { Button, PageContainer } from "@niar/ui";
import { clearPlatformSession } from "@niar/auth";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { clearAuthUser, selectAuthUser } from "../../store/auth/auth.slice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getRoleNavigation } from "../../routes/role-routes";

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);

  if (!user) return null;

  const navigation = getRoleNavigation(user.role);
  const activeItem = navigation.find(({ path }) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`),
  )?.path ?? navigation[0]?.path;

  const handleLogout = () => {
    clearPlatformSession();
    dispatch(clearAuthUser());
    navigate("/login", { replace: true });
  };

  return (
    <PageContainer
      tabs={navigation.map(({ label, path }) => ({ label, value: path }))}
      activeItem={activeItem}
      onItemChange={(path) => navigate(path)}
      showAvatar={false}
      actions={
        <Button variant="outlined" size="small" onClick={handleLogout}>
          Sair
        </Button>
      }
    >
      <Outlet />
    </PageContainer>
  );
}
