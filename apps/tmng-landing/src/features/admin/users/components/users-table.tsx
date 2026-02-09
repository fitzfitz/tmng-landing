import { useState } from "react";
import { format } from "date-fns";
import { useUsers, useDeleteUser, User } from "../api/use-users";
import {
  MoreVertical,
  Edit,
  Trash2,
  User as UserIcon,
  ShieldCheck,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface UsersTableProps {
  onEdit: (user: User) => void;
}

export function UsersTable({ onEdit }: UsersTableProps) {
  const { data: users, isLoading } = useUsers();
  const deleteUser = useDeleteUser();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setIsDeleting(id);
      try {
        await deleteUser.mutateAsync(id);
      } catch (error) {
        console.error("Failed to delete user:", error);
        alert("Failed to delete user");
      } finally {
        setIsDeleting(null);
      }
    }
  };

  return (
    <div className="glass-card overflow-hidden rounded-2xl border border-white/10">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="p-4 text-purple-200 font-medium text-sm">User</th>
              <th className="p-4 text-purple-200 font-medium text-sm">Role</th>
              <th className="p-4 text-purple-200 font-medium text-sm">
                Joined
              </th>
              <th className="p-4 text-purple-200 font-medium text-sm text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-purple-200/50">
                  <div className="flex justify-center mb-2">
                    <div className="w-6 h-6 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                  Loading users...
                </td>
              </tr>
            ) : users && users.length > 0 ? (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-white/5 transition-colors group"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/5 shrink-0 border border-white/10 flex items-center justify-center overflow-hidden">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-purple-200 font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          {user.name}
                        </div>
                        <div className="text-xs text-purple-200/50">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
                        user.role === "admin"
                          ? "bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20"
                          : "bg-purple-500/10 text-purple-300 border-purple-500/20"
                      }`}
                    >
                      {user.role === "admin" ? (
                        <ShieldCheck size={12} />
                      ) : (
                        <UserIcon size={12} />
                      )}
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="p-4 text-purple-200/60 text-sm">
                    {format(new Date(user.createdAt), "MMM d, yyyy")}
                  </td>
                  <td className="p-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2 text-purple-200/50 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
                          <MoreVertical size={18} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-black/90 border-white/10 text-purple-100 backdrop-blur-xl"
                      >
                        <DropdownMenuItem
                          onClick={() => onEdit(user)}
                          className="cursor-pointer gap-2"
                        >
                          <Edit size={14} />
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem
                          className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer gap-2"
                          onClick={() => handleDelete(user.id)}
                          disabled={isDeleting === user.id}
                        >
                          <Trash2 size={14} />
                          {isDeleting === user.id ? "Deleting..." : "Delete"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-12 text-center text-purple-200/50">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
