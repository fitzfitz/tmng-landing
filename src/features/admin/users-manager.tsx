import { useState, useEffect } from "react";
import { format } from "date-fns";

type User = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: "pending" | "author" | "admin";
  createdAt: string;
};

type UsersManagerProps = {
  currentUserId: string;
};

export default function UsersManager({ currentUserId }: UsersManagerProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.data) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setError("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (userId === currentUserId && newRole !== "admin") {
      alert("You cannot demote yourself.");
      return;
    }

    setUpdatingId(userId);
    setError("");

    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update role");
      }

      // Optimistic update acceptable, but fetching ensures sync
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as any } : u));
    } catch (err: any) {
      setError(err.message);
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-8 h-8 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          {error}
        </div>
      )}

      <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-purple-200/70">
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium text-right">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.image ? (
                        <img src={user.image} alt={user.name} className="w-10 h-10 rounded-full" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300 font-medium">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-white">{user.name}</div>
                        <div className="text-purple-200/50 text-xs">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative">
                       {updatingId === user.id ? (
                          <div className="w-4 h-4 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div>
                       ) : (
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          disabled={user.id === currentUserId}
                          className={`
                            appearance-none pl-3 pr-8 py-1 rounded-full text-xs font-medium border focus:outline-none focus:ring-1 focus:ring-fuchsia-500
                            ${
                              user.role === "admin"
                                ? "bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/30"
                                : user.role === "author"
                                ? "bg-purple-500/10 text-purple-300 border-purple-500/30"
                                : "bg-white/5 text-gray-400 border-white/10"
                            }
                            ${user.id === currentUserId ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-white/10"}
                          `}
                        >
                          <option value="pending" className="bg-obsidian-900 text-gray-400">Pending</option>
                          <option value="author" className="bg-obsidian-900 text-purple-300">Author</option>
                          <option value="admin" className="bg-obsidian-900 text-fuchsia-300">Admin</option>
                        </select>
                       )}
                       {/* Custom arrow for select if not updating */}
                       {updatingId !== user.id && (
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white/50">
                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                          </svg>
                        </div>
                       )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-purple-200/50">
                    {format(new Date(user.createdAt), "MMM d, yyyy")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
