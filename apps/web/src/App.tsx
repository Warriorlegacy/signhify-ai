import { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./stores/authStore";
import { useSettingsStore } from "./stores/settingsStore";
import { useThemeStore } from "./stores/themeStore";
import { AuthView } from "./views/Auth";
import { Onboarding } from "./views/Onboarding";
import { ErrorBoundary } from "./components/shared/ErrorBoundary";

// Lazy load heavy components
const Dashboard = lazy(() =>
  import("./views/Dashboard").then((m) => ({ default: m.Dashboard })),
);

function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-obsidian flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin"
          style={{
            borderColor: "rgba(0, 229, 255, 0.3)",
            borderTopColor: "#00e5ff",
          }}
        />
        <p className="text-sm" style={{ color: "rgba(148,163,184,0.6)" }}>
          Loading...
        </p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loadFromStorage } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadFromStorage();
    setReady(true);
  }, []);

  if (!ready) return <LoadingScreen />;
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

  if (!ready) return <LoadingScreen />;

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
                <Suspense fallback={<LoadingScreen />}>
                  <Dashboard />
                </Suspense>
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
