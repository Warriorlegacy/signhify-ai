import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchApi } from "../lib/api";
import { useAuthStore } from "../stores/authStore";
import { Landing } from "./Landing";
import { BackgroundScene } from "../components/3d/Scene";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";

export function AuthView() {
  const [showLanding, setShowLanding] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const body: any = { email, password };
      if (!isLogin) body.displayName = displayName;

      const data = await fetchApi<{ token: string; user: any }>(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
      });

      login(data.token, data.user);
      navigate("/app");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (showLanding) {
    return (
      <>
        <Landing onGetStarted={() => setShowLanding(false)} />
      </>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-obsidian text-foreground overflow-hidden">
      <BackgroundScene />

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-panel relative z-10 w-full max-w-md rounded-3xl p-8 neon-glow"
        >
          <div className="mb-8 flex items-center gap-2 font-display text-lg font-bold">
            <span className="h-2.5 w-2.5 rounded-full bg-primary neon-glow" />
            SIGNHIFY<span className="text-primary">.AI</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight">
            {!isLogin ? "Create your workspace" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {!isLogin
              ? "Spin up your self-learning AI workspace in seconds."
              : "Sign in to continue to your agents."}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {!isLogin && (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="input-base"
                  placeholder="Your name"
                  required
                />
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-base"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-base"
                placeholder="••••••••"
                minLength={8}
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-400/90 bg-red-400/10 p-2 rounded-md border border-red-400/20">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="shimmer-btn flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-bold text-primary-foreground neon-glow transition-transform hover:scale-[1.02] disabled:opacity-70"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading
                ? "AUTHENTICATING..."
                : isLogin
                  ? "SIGN IN"
                  : "CREATE ACCOUNT"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isLogin ? "New here?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="font-semibold text-primary hover:underline ml-1"
            >
              {isLogin ? "Create account" : "Sign in"}
            </button>
          </p>

          <button
            onClick={() => setShowLanding(true)}
            className="mx-auto mt-6 flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to home
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
