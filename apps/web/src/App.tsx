import { useState, useEffect } from "react";
import { useAuthStore } from "./stores/authStore";
import { useSettingsStore } from "./stores/settingsStore";
import { AuthView } from "./views/Auth";
import { Dashboard, View } from "./views/Dashboard";
import { ErrorBoundary } from "./components/shared/ErrorBoundary";

function AppContent() {
  const { isAuthenticated, loadFromStorage } = useAuthStore();
  const { loadKeys } = useSettingsStore();
  const [currentView, setCurrentView] = useState<View>("chat");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadFromStorage();
    loadKeys();
    setReady(true);
  }, []);

  if (!ready) return null;

  if (!isAuthenticated) {
    return <AuthView />;
  }

  return <Dashboard currentView={currentView} onViewChange={setCurrentView} />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
