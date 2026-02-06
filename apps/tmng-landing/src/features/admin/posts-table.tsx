import { useState, useEffect } from "react";
import { format } from "date-fns";
import apiClient from "@/lib/api-client";
import { ENDPOINTS } from "@/config/endpoints";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Post = {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published" | "archived";
  views: number;
  publishedAt: string | null;
  createdAt: string;
  author: {
    name: string;
    image: string | null;
  };
};

export default function PostsTable() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
      });

      const res = await apiClient.get(`${ENDPOINTS.ADMIN.POSTS}?${params}`);
      const data = res.data;
      
      if (data.data) {
        setPosts(data.data);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchPosts();
    }, 300);
    return () => clearTimeout(timer);
  }, [page, search, statusFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      await apiClient.delete(`${ENDPOINTS.ADMIN.POSTS}/${id}`);
      fetchPosts(); // Refresh
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete post");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-200/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search posts..."
            className="w-full pl-10 pr-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white placeholder-purple-200/30 focus:outline-none focus:border-fuchsia-500/50 transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value || "")}
          >
            <SelectTrigger className="w-[180px] bg-black/20 border border-white/10 text-purple-200 focus:outline-none focus:border-fuchsia-500/50">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="bg-black/80 border-white/10 text-white">
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <a
            href="/admin/posts/new"
            className="flex items-center gap-2 px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-lg transition-colors font-medium shadow-lg shadow-fuchsia-600/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Post
          </a>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-purple-200/70">
                <th className="px-6 py-4 font-medium">Title</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Author</th>
                <th className="px-6 py-4 font-medium text-right">Views</th>
                <th className="px-6 py-4 font-medium text-right">Date</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-purple-200/50">
                    <div className="inline-block w-6 h-6 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p>Loading posts...</p>
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-purple-200/50">
                    No posts found. Create your first one!
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white group-hover:text-fuchsia-300 transition-colors">
                        {post.title}
                      </div>
                      <div className="text-xs text-purple-200/50 truncate max-w-[200px]">
                        /{post.slug}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        post.status === 'published' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : post.status === 'draft'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>
                        {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                      </span>
                    </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {post.author ? (
                            <>
                              {post.author.image ? (
                                <img src={post.author.image} alt={post.author.name} className="w-6 h-6 rounded-full" />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs text-purple-300">
                                  {post.author.name?.charAt(0) || "U"}
                                </div>
                              )}
                              <span className="text-purple-200/90">{post.author.name}</span>
                            </>
                          ) : (
                            <>
                              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/50">?</div>
                              <span className="text-purple-200/50 italic">Unknown</span>
                            </>
                          )}
                        </div>
                      </td>
                    <td className="px-6 py-4 text-right text-purple-200/70 font-mono">
                      {post.views?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-purple-200/70">
                      {post.publishedAt ? format(new Date(post.publishedAt), "MMM d, yyyy") : "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a 
                          href={`/admin/posts/${post.id}/edit`}
                          className="p-2 text-purple-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </a>
                        <button 
                          onClick={() => handleDelete(post.id)}
                          className="p-2 text-purple-200 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-sm bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-purple-200 transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-purple-200/50">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 text-sm bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-purple-200 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
