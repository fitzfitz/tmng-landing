import { useState, useEffect } from "react";

type ContactSubmission = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "new" | "read" | "replied" | "archived";
  createdAt: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export default function ContactsManager() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, [page, statusFilter]);

  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });
      
      if (statusFilter) params.append("status", statusFilter);

      const res = await fetch(`/api/admin/contacts?${params}`);
      const data = await res.json();

      if (data.data) {
        setSubmissions(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/contacts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setSubmissions((prev) => 
          prev.map((sub) => sub.id === id ? { ...sub, status: newStatus as any } : sub)
        );
        if (selectedSubmission?.id === id) {
            setSelectedSubmission(prev => prev ? { ...prev, status: newStatus as any } : null);
        }
      }
    } catch (error) {
      console.error("Update status error:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    try {
      const res = await fetch(`/api/admin/contacts/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setSubmissions((prev) => prev.filter((sub) => sub.id !== id));
        setSelectedSubmission(null);
      } else {
        alert("Failed to delete message");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Error deleting message");
    }
  };

  const openMessage = (sub: ContactSubmission) => {
    setSelectedSubmission(sub);
    if (sub.status === "new") {
        updateStatus(sub.id, "read");
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-2 border-b border-white/10 pb-4 overflow-x-auto">
        {["", "new", "read", "archived"].map((stat) => (
            <button
                key={stat}
                onClick={() => { setStatusFilter(stat); setPage(1); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize whitespace-nowrap ${
                    statusFilter === stat
                    ? "bg-white/10 text-white"
                    : "text-purple-200/50 hover:text-white hover:bg-white/5"
                }`}
            >
                {stat || "All Messages"}
            </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="p-4 text-purple-200 font-medium text-sm">Status</th>
                <th className="p-4 text-purple-200 font-medium text-sm">From</th>
                <th className="p-4 text-purple-200 font-medium text-sm">Subject</th>
                <th className="p-4 text-purple-200 font-medium text-sm">Date</th>
                <th className="p-4 text-right text-purple-200 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                   <td colSpan={5} className="p-8 text-center text-purple-200/50">Loading messages...</td>
                </tr>
              ) : submissions.length > 0 ? (
                submissions.map((sub) => (
                  <tr 
                    key={sub.id} 
                    className={`hover:bg-white/5 transition-colors cursor-pointer ${sub.status === 'new' ? 'bg-fuchsia-500/5' : ''}`}
                    onClick={() => openMessage(sub)}
                  >
                    <td className="p-4">
                      <span className={`
                        w-2 h-2 rounded-full inline-block mr-2
                        ${sub.status === "new" ? "bg-fuchsia-500" : 
                          sub.status === "read" ? "bg-purple-500/30" : "bg-white/20"}
                      `}></span>
                      <span className="text-xs uppercase font-medium text-purple-200/70">{sub.status}</span>
                    </td>
                    <td className="p-4">
                        <div className="text-white font-medium">{sub.name}</div>
                        <div className="text-xs text-purple-200/50">{sub.email}</div>
                    </td>
                    <td className="p-4 text-purple-200 text-sm truncate max-w-xs">{sub.subject}</td>
                    <td className="p-4 text-purple-200/50 text-sm">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                       <button
                         onClick={(e) => { e.stopPropagation(); handleDelete(sub.id); }}
                         className="p-2 text-purple-200/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
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
                    No messages found.
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

      {/* Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedSubmission(null)}>
            <div className="bg-obsidian-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-white/10 flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold text-white mb-1">{selectedSubmission.subject}</h2>
                        <div className="flex items-center gap-2 text-sm text-purple-200/60">
                            <span>From: <strong className="text-purple-200">{selectedSubmission.name}</strong> &lt;{selectedSubmission.email}&gt;</span>
                            <span>•</span>
                            <span>{new Date(selectedSubmission.createdAt).toLocaleString()}</span>
                        </div>
                    </div>
                    <button onClick={() => setSelectedSubmission(null)} className="text-purple-200/50 hover:text-white">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-6 whitespace-pre-wrap text-purple-100 leading-relaxed text-sm md:text-base">
                    {selectedSubmission.message}
                </div>
                <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-white/5">
                     {selectedSubmission.status !== 'archived' && (
                        <button 
                            onClick={() => { updateStatus(selectedSubmission.id, "archived"); setSelectedSubmission(null); }}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            Archive
                        </button>
                     )}
                     <button 
                        onClick={() => { handleDelete(selectedSubmission.id); }}
                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-medium transition-colors"
                     >
                        Delete
                     </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
