import { useState } from "react";
import { useSubscribers, useDeleteSubscriber } from "../api/use-subscribers";
import { format } from "date-fns";
import { Mail, Trash2, Search } from "lucide-react";

export function SubscribersManager() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data: subscribersData, isLoading } = useSubscribers({
    page,
    limit: 10,
    search,
  });
  const deleteSubscriber = useDeleteSubscriber();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to remove this subscriber?")) {
      setIsDeleting(id);
      try {
        await deleteSubscriber.mutateAsync(id);
      } catch (error) {
        alert("Failed to delete subscriber");
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Subscribers</h1>
          <p className="text-purple-200/50 text-sm">
            Manage newsletter subscriptions
          </p>
        </div>
        <form onSubmit={handleSearch} className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 pl-10 text-white focus:outline-none focus:border-fuchsia-500/50"
          />
          <Search
            className="absolute left-3 top-2.5 text-purple-200/50"
            size={18}
          />
        </form>
      </div>

      <div className="glass-card overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="p-4 text-purple-200 font-medium text-sm">Email</th>
              <th className="p-4 text-purple-200 font-medium text-sm">
                Status
              </th>
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
                  Loading...
                </td>
              </tr>
            ) : subscribersData?.data && subscribersData.data.length > 0 ? (
              subscribersData.data.map((sub) => (
                <tr key={sub.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                        <Mail size={14} />
                      </div>
                      {sub.email}
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                        sub.status === "active"
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                      }`}
                    >
                      {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-4 text-purple-200/60 text-sm">
                    {format(new Date(sub.createdAt), "MMM d, yyyy")}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(sub.id)}
                      disabled={isDeleting === sub.id}
                      className="p-2 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Remove subscriber"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-8 text-center text-purple-200/50">
                  No subscribers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {subscribersData?.pagination &&
          subscribersData.pagination.totalPages > 1 && (
            <div className="p-4 border-t border-white/10 flex justify-between items-center bg-white/5">
              <span className="text-sm text-purple-200/50">
                Page {page} of {subscribersData.pagination.totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-purple-200 disabled:opacity-50 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setPage((p) =>
                      Math.min(subscribersData.pagination.totalPages, p + 1),
                    )
                  }
                  disabled={page === subscribersData.pagination.totalPages}
                  className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-purple-200 disabled:opacity-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
