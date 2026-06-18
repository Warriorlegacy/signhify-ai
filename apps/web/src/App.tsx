import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./stores/authStore";
import { useSettingsStore } from "./stores/settingsStore";
import { useThemeStore } from "./stores/themeStore";
import { AuthView } from "./views/Auth";
import { Dashboard } from "./views/Dashboard";
import { Onboarding } from "./views/Onboarding";
import { ErrorBoundary } from "./components/shared/ErrorBoundary";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loadFromStorage } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadFromStorage();
    setReady(true);
  }, []);

  if (!ready) return null;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { hasKeys, loadKeys } = useSettingsStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadKeys();
    setReady(true);
  }, []);

  if (!ready) return null;

  if (!hasKeys) {
    return <Onboarding onComplete={() => {}} />;
  }

  return <>{children}</>;
}

function AppContent() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthView />} />
        <Route
          path="/app/*"
          element={
            <ProtectedRoute>
              <OnboardingGuard>
                <Dashboard />
              </OnboardingGuard>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  const { loadTheme } = useThemeStore();

  useEffect(() => {
    loadTheme();
  }, []);

  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
