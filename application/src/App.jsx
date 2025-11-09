import { useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import InstancesPage from "./pages/InstancesPage";
import DbsRdsPage from "./pages/DbsRdsPage";
import EksClustersPage from "./pages/EksClustersPage";
import S3BucketsPage from "./pages/S3BucketsPage";
import Navbar from "./Navbar/Navbar";

function RequireAuth({ children }) {
  const auth = useAuth();

  useEffect(() => {
    if (window.location.pathname === "/callback" && auth.isAuthenticated) {
      window.history.replaceState({}, "", "/");
    }
  }, [auth.isAuthenticated]);

  if (auth.isLoading) return <div>Loading...</div>;

  if (auth.error) return <div>Encountered error: {auth.error.message}</div>;

  if (!auth.isAuthenticated) {
    auth.signinRedirect();
    return <div>Redirecting to login...</div>;
  }

  return children;
}

function App() {
  return (
    <Router>
      <RequireAuth>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/instances" element={<InstancesPage />} />
          <Route path="/dbs-rds" element={<DbsRdsPage />} />
          <Route path="/eks-clusters" element={<EksClustersPage />} />
          <Route path="/s3-buckets" element={<S3BucketsPage />} />
          {/* Fallback redirect to home for unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </RequireAuth>
    </Router>
  );
}

export default App;
