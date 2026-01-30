import { useState, useEffect } from "react";

type Subscriber = {
  id: string;
  email: string;
  firstName: string | null;
  status: "pending" | "active" | "unsubscribed";
  source: string | null;
  createdAt: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export default function SubscribersManager() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchSubscribers();
  }, [page, search]);

  const fetchSubscribers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });
      
      if (search) params.append("search", search);

      const res = await fetch(`/api/admin/subscribers?${params}`);
      const data = await res.json();

      if (data.data) {
        setSubscribers(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch subscribers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to remove ${email} from the list?`)) return;

    try {
      const res = await fetch(`/api/admin/subscribers/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setSubscribers((prev) => prev.filter((sub) => sub.id !== id));
        alert("Subscriber removed");
      } else {
        alert("Failed to delete subscriber");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Error deleting subscriber");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchSubscribers();
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <form onSubmit={handleSearch} className="relative max-w-md w-full">
          <input
            type="text"
            placeholder="Search email..."
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 pl-10 text-white focus:outline-none focus:border-fuchsia-500/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <svg className="w-5 h-5 text-purple-200/50 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </form>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="p-4 text-purple-200 font-medium text-sm">Email</th>
                <th className="p-4 text-purple-200 font-medium text-sm">Status</th>
                <th className="p-4 text-purple-200 font-medium text-sm">Source</th>
                <th className="p-4 text-purple-200 font-medium text-sm">Joined</th>
                <th className="p-4 text-right text-purple-200 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-purple-200/50">
                    <div className="flex justify-center mb-2">
                       <div className="w-6 h-6 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    Loading subscribers...
                  </td>
                </tr>
              ) : subscribers.length > 0 ? (
                subscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 text-white font-medium">{sub.email}</td>
                    <td className="p-4">
                      <span className={`
                        px-2 py-1 rounded-full text-xs font-medium border
                        ${sub.status === "active" 
                          ? "bg-green-500/10 text-green-400 border-green-500/20" 
                          : sub.status === "pending"
                          ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                        }
                      `}>
                        {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-4 text-purple-200/70 text-sm">{sub.source || "-"}</td>
                    <td className="p-4 text-purple-200/70 text-sm">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(sub.id, sub.email)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete subscriber"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-purple-200/50">
                    No subscribers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
            <div className="p-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-sm text-purple-200/50">
                    Page {pagination.page} of {pagination.totalPages}
                </span>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={pagination.page === 1}
                        className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-purple-200 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                        disabled={pagination.page === pagination.totalPages}
                        className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-purple-200 disabled:opacity-50"
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
