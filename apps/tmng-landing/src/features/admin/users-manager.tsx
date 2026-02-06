import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import apiClient from "@/lib/api-client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type User = {
  id: string;
  name?: string;
  email: string;
  image?: string | null;
  role: "author" | "admin" | string;
  createdAt: string;
};

const ROLES = ["author", "admin"];

const getRoleColor = (role: string) => {
  switch (role) {
    case "admin": return "bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20";
    case "author": return "bg-purple-500/10 text-purple-300 border-purple-500/20";
    default: return "bg-white/5 text-gray-400 border-white/10";
  }
};

export default function UsersManager() {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch Current User
  const { data: authData, isLoading: authLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const res = await apiClient.get("/api/auth/me");
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const currentUserId = authData?.user?.id;

  // Fetch Users
  const { data: usersData, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
        const res = await apiClient.get("/api/admin/users");
        return res.data;
    },
    retry: 1
  });

  const users = usersData?.data || [];
  const isLoading = usersLoading || authLoading;

  // Update Role Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
       await apiClient.put(`/api/admin/users/${id}`, { role });
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["users"] });
        setOpenMenuId(null);
        setUpdateError(null);
    },
    onError: (err: any) => {
        setUpdateError(err.response?.data?.error || err.message || "Failed to update role");
        setTimeout(() => setUpdateError(null), 3000);
    }
  });

  // Delete User Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
       await apiClient.delete(`/api/admin/users/${id}`);
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["users"] });
        setUpdateError(null);
    },
    onError: (err: any) => {
        setUpdateError(err.response?.data?.error || err.message || "Failed to delete user");
        setTimeout(() => setUpdateError(null), 3000);
    }
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "author"
  });

  // Create User Mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof createForm) => {
       await apiClient.post("/api/admin/users", data);
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["users"] });
        setIsCreateOpen(false);
        setCreateForm({ name: "", email: "", password: "", role: "author" });
        setUpdateError(null);
    },
    onError: (err: any) => {
        setUpdateError(err.response?.data?.error || err.message || "Failed to create user");
        setTimeout(() => setUpdateError(null), 3000);
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-8 h-8 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {(usersError || updateError) && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          {(usersError as any)?.message || updateError || "Failed to load users"}
        </div>
      )}
      
      <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Team Members</h2>
            <button
                onClick={() => setIsCreateOpen(true)}
                className="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-fuchsia-500/20"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add User
            </button>
      </div>

      <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-purple-200/70 bg-white/5">
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium text-right">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user: User) => {
                 const isSelf = currentUserId && user.id === currentUserId;
                 const isOpen = openMenuId === user.id;
                 const isUpdating = updateMutation.isPending && updateMutation.variables?.id === user.id;
                 const isDeleting = deleteMutation.isPending && deleteMutation.variables === user.id;

                 return (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs ring-1 ring-white/10">
                                    {user.image ? <img src={user.image} className="w-full h-full rounded-full object-cover"/> : user.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="font-medium text-white">{user.name} {isSelf && <span className="text-xs text-purple-300 ml-1">(You)</span>}</div>
                                    <div className="text-purple-200/50 text-xs">{user.email}</div>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 relative">
                            <div className="relative">
                                {isOpen && (
                                   <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                                )}
                                <button
                                    onClick={() => !isSelf && !isUpdating && !isDeleting && setOpenMenuId(isOpen ? null : user.id)}
                                    disabled={isSelf || isUpdating || isDeleting}
                                    className={`
                                        inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                                        ${getRoleColor(user.role)}
                                        ${isSelf ? 'opacity-70 cursor-not-allowed' : 'hover:bg-white/10 cursor-pointer'}
                                        ${isOpen ? 'ring-2 ring-purple-500/50' : ''}
                                    `}
                                >
                                    <span className="capitalize">{user.role}</span>
                                    {!isSelf && (
                                        isUpdating ? (
                                            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"/>
                                        ) : (
                                            <svg className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        )
                                    )}
                                </button>
                                {isOpen && (
                                    <div className="absolute top-full right-0 mt-2 z-20 w-48 bg-bg-dark-alt border border-white/10 rounded-xl shadow-xl overflow-hidden ring-1 ring-white/5 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="p-1 space-y-0.5 border-b border-white/5 pb-1 mb-1">
                                            <div className="px-3 py-2 text-xs font-medium text-purple-200/50 uppercase tracking-wider">Change Role</div>
                                            {ROLES.map(role => (
                                                <button
                                                    key={role}
                                                    onClick={() => updateMutation.mutate({ id: user.id, role })}
                                                    disabled={user.role === role}
                                                    className={`
                                                        w-full text-left px-3 py-2 rounded-lg text-sm capitalize transition-colors flex items-center justify-between
                                                        ${user.role === role ? 'bg-purple-500/10 text-purple-300 cursor-default' : 'text-gray-400 hover:text-white hover:bg-white/5'}
                                                    `}
                                                >
                                                    {role}
                                                    {user.role === role && (
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="p-1 pt-0">
                                            <button
                                                onClick={() => {
                                                    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
                                                        deleteMutation.mutate(user.id);
                                                    }
                                                }}
                                                className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center gap-2 group"
                                            >
                                                {isDeleting ? (
                                                    <div className="w-4 h-4 border-2 border-red-500/50 border-t-red-500 rounded-full animate-spin"/>
                                                ) : (
                                                    <svg className="w-4 h-4 text-red-400/50 group-hover:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                )}
                                                Delete User
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </td>
                        <td className="px-6 py-4 text-right text-purple-200/50">
                            {format(new Date(user.createdAt), "MMM d, yyyy")}
                        </td>
                    </tr>
                 );
              })}
            </tbody>
          </table>
          {users.length === 0 && !isLoading && !usersError && (
             <div className="text-center py-12 text-purple-200/30">
                 No users found.
             </div>
          )}
        </div>
      </div>

      {/* Create User Dialog */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-bg-dark-alt border border-white/10 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/10 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Add New User</h3>
                    <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    createMutation.mutate(createForm);
                }} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-purple-200/70 mb-1">Name</label>
                        <input
                            type="text"
                            required
                            value={createForm.name}
                            onChange={e => setCreateForm({...createForm, name: e.target.value})}
                            className="w-full px-4 py-2.5 rounded-xl bg-black/20 border border-white/10 text-white placeholder-purple-200/30 focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50 transition-all"
                            placeholder="John Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-purple-200/70 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={createForm.email}
                            onChange={e => setCreateForm({...createForm, email: e.target.value})}
                            className="w-full px-4 py-2.5 rounded-xl bg-black/20 border border-white/10 text-white placeholder-purple-200/30 focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50 transition-all"
                            placeholder="john@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-purple-200/70 mb-1">Role</label>
                        <Select
                            value={createForm.role}
                            onValueChange={(val) => val && setCreateForm({...createForm, role: val})}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                {ROLES.map(role => (
                                    <SelectItem key={role} value={role} className="capitalize">{role}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-purple-200/70 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={createForm.password}
                            onChange={e => setCreateForm({...createForm, password: e.target.value})}
                            className="w-full px-4 py-2.5 rounded-xl bg-black/20 border border-white/10 text-white placeholder-purple-200/30 focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50 transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={() => setIsCreateOpen(false)}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="flex-1 px-4 py-2.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {createMutation.isPending ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                "Create User"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}
