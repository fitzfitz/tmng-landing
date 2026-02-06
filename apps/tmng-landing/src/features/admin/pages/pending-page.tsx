import { useEffect, useState } from "react";

export function PendingPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            if (data.user.role !== "pending") {
                window.location.href = "/admin"; // Redirect if approved
                return;
            }
            setUser(data.user);
          } else {
             window.location.href = "/admin/login";
          }
        } else {
             window.location.href = "/admin/login";
        }
      } catch (error) {
        window.location.href = "/admin/login";
      } finally {
        setLoading(false);
      }
    }
    fetchSession();
  }, []);

  const handleSignOut = async () => {
      await fetch("/api/auth/signout", { method: "POST" });
      window.location.href = "/admin/login";
  };

  if (loading) return (
     <div className="min-h-screen flex items-center justify-center bg-obsidian-950">
        <div className="w-8 h-8 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div>
     </div>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center py-20 bg-obsidian-950 text-white">
      <div className="w-full max-w-md p-6">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-10 text-center backdrop-blur-xl">
          {/* Avatar */}
          <div className="mb-6">
            {user.image ? (
              <img 
                src={user.image} 
                alt={user.name} 
                className="w-20 h-20 rounded-full mx-auto border-4 border-fuchsia-500/30"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-fuchsia-500/20 flex items-center justify-center mx-auto text-fuchsia-300 text-3xl font-bold">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
          </div>

          {/* Message */}
          <h1 className="text-2xl font-bold text-white mb-2">
            Hi, {user.name}! 👋
          </h1>
          <p className="text-purple-200/70 mb-6">
            Your account is pending approval. An administrator will review your request soon.
          </p>

          {/* Status */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 rounded-xl mb-6">
            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
            <span className="text-yellow-300 text-sm font-medium">Pending Approval</span>
          </div>

          {/* Info */}
          <div className="bg-white/5 rounded-xl p-4 mb-6 text-left">
            <p className="text-purple-200/60 text-sm">
              <strong className="text-white">Email:</strong> {user.email}
            </p>
          </div>

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="w-full px-6 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
