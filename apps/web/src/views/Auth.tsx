import { useState } from "react";
import { fetchApi } from "../lib/api";
import { useAuthStore } from "../stores/authStore";
import { Landing } from "./Landing";
import { BackgroundScene } from "../components/3d/Scene";
import { motion, AnimatePresence } from "framer-motion";

export function AuthView() {
  const [showLanding, setShowLanding] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();

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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (showLanding) {
    return <Landing onEnter={() => setShowLanding(false)} />;
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-obsidian text-slate-200 overflow-hidden">
      <BackgroundScene />
      
      <div className="absolute inset-0 bg-obsidian/60 backdrop-blur-sm z-0"></div>

      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-sm"
        >
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-teal to-lucid-aqua drop-shadow-[0_0_15px_rgba(0,229,255,0.4)]">
              Signhify
            </h1>
            <p className="mt-2 text-sm text-slate-400 font-light">
              Type less. Orchestrate more.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-8 backdrop-blur-md shadow-2xl"
          >
            <h2 className="text-xl font-semibold text-slate-100">
              {isLogin ? "Access Command Center" : "Initialize Workspace"}
            </h2>

            {!isLogin && (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Operative Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-cyan-teal focus:ring-1 focus:ring-cyan-teal/50 transition-all placeholder-slate-500"
                  placeholder="Enter designation"
                  required
                />
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400 uppercase tracking-wider">
                Credentials (Email)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-cyan-teal focus:ring-1 focus:ring-cyan-teal/50 transition-all placeholder-slate-500"
                placeholder="operative@signhify.ai"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400 uppercase tracking-wider">
                Security Key (Password)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-cyan-teal focus:ring-1 focus:ring-cyan-teal/50 transition-all"
                placeholder="••••••••"
                minLength={8}
                required
              />
            </div>

            {error && <p className="text-sm text-red-400/90 bg-red-400/10 p-2 rounded-md border border-red-400/20">{error}</p>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-2 group relative px-4 py-3 bg-cyan-teal/10 border border-cyan-teal/50 rounded-lg overflow-hidden transition-all hover:bg-cyan-teal/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-teal/0 via-cyan-teal/10 to-cyan-teal/0 group-hover:translate-x-full duration-1000 transition-transform ease-in-out" />
              <div className="relative flex items-center justify-center gap-2 font-semibold text-cyan-teal tracking-wide">
                {loading ? "AUTHENTICATING..." : (isLogin ? "INITIALIZE" : "REGISTER")}
              </div>
            </button>

            <div className="pt-2 text-center border-t border-slate-800/50 mt-4">
              <p className="text-xs text-slate-500">
                {isLogin ? "No active workspace?" : "Workspace already initialized?"}{" "}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-cyan-teal hover:text-lucid-aqua transition-colors ml-1 font-medium"
                >
                  {isLogin ? "Create one" : "Access it"}
                </button>
              </p>
            </div>
          </form>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
