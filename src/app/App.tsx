import { Navigate, Outlet, Route, Routes } from "react-router";
import { LoginPage } from "@/features/auth";
import { ChatsPage } from "@/features/chat";
import { routes, useSession } from "@/shared/model";

function ProtectedRoute() {
  const { credentials } = useSession();
  return credentials ? <Outlet /> : <Navigate to={routes.login} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path={routes.login} element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path={routes.chats} element={<ChatsPage />} />
        <Route path={routes.chat} element={<ChatsPage />} />
      </Route>
      <Route path="*" element={<Navigate to={routes.chats} replace />} />
    </Routes>
  );
}
