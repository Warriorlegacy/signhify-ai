import { useState } from "react";
import { fetchApi } from "../lib/api";
import { useAuthStore } from "../stores/authStore";
import { Button } from "../components/shared/Button";

export function AuthView() {
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-amber-500">Signhify</h1>
          <p className="mt-1 text-sm text-gray-500">
            Type less. Signhify everything.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-gray-800 bg-gray-900 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-100">
            {isLogin ? "Sign In" : "Create Account"}
          </h2>

          {!isLogin && (
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-400">
                Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 outline-none focus:border-amber-500/50"
                required
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-400">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 outline-none focus:border-amber-500/50"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-400">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 outline-none focus:border-amber-500/50"
              minLength={8}
              required
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button type="submit" className="w-full" isLoading={loading}>
            {isLogin ? "Sign In" : "Create Account"}
          </Button>

          <p className="text-center text-sm text-gray-500">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-amber-500 hover:text-amber-400"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
