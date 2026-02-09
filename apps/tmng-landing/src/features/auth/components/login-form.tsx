import { useState } from "react";
import { axiosInstance } from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/endpoints";
import { APP_CONSTANTS } from "@/config/constants";
import { Loader2 } from "lucide-react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      });

      const data = response.data;

      // Store token in localStorage/cookie
      if (data.token) {
        localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.AUTH_TOKEN, data.token);
        localStorage.setItem(
          APP_CONSTANTS.STORAGE_KEYS.USER,
          JSON.stringify(data.user),
        );
      }

      window.location.href = "/admin";
    } catch (err: any) {
      console.error("Sign in error:", err);
      const message =
        err.response?.data?.message ||
        err.message ||
        "Invalid email or password";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-purple-200/70 mb-1">
          Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-purple-200/30 focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50 transition-all"
          placeholder="admin@tmng.my.id"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-purple-200/70 mb-1">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-purple-200/30 focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50 transition-all"
          placeholder="••••••••"
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-linear-to-r from-fuchsia-600 to-purple-600 text-white font-medium rounded-xl hover:opacity-90 transition-all shadow-lg shadow-fuchsia-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm text-center">
          {error}
        </div>
      )}
    </form>
  );
}
