// import { useSelector } from "react-redux";
// import "./App.css";
// import Dashboard from "./components/dashboard";
// import type { RootState } from "./store/store";
// import Auth from "./components/common/auth";

// function App() {
//   const { isAuthenticated } = useSelector((state: RootState) => state.auth);

//   if (!isAuthenticated) return <Auth />;

//   return <Dashboard />;
// }

// export default App;

import { useSelector } from "react-redux";
import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
// import type { RootState } from "./store/store";
import Auth from "./components/common/auth";
import NetworksListPage from "./pages/NetworksListPage";
import NetworkDashboardPage from "./pages/NetworkDashboardPage";
import type { RootState } from "./store/rootReducer";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useSelector((s: RootState) => s.auth);
  if (!isAuthenticated) return <Auth />;
  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <RequireAuth>
            <Navigate to="/networks" replace />
          </RequireAuth>
        }
      />
      <Route
        path="/networks"
        element={
          <RequireAuth>
            <NetworksListPage />
          </RequireAuth>
        }
      />
      <Route
        path="/networks/:nid"
        element={
          <RequireAuth>
            <NetworkDashboardPage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/networks" replace />} />
    </Routes>
  );
}

export default App;
