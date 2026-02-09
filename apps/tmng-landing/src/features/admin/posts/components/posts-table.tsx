import { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { usePosts, useDeletePost } from "../api/use-posts";
import {
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  FileText,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function PostsTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: postsData, isLoading } = usePosts({
    page,
    limit: 10,
    search,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const deletePost = useDeletePost();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this post?")) {
      setIsDeleting(id);
      try {
        await deletePost.mutateAsync(id);
      } catch (error) {
        console.error("Failed to delete post:", error);
        alert("Failed to delete post");
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to page 1 on search
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Posts</h1>
          <p className="text-purple-200/50 text-sm">
            Manage your blog posts and articles
          </p>
        </div>
        <Link
          to="/admin/posts/new"
          className="flex items-center gap-2 px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl transition-colors font-medium shadow-lg shadow-fuchsia-600/20"
        >
          <Plus size={18} />
          New Post
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        {/* Status Tabs */}
        <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10 w-fit">
          {["all", "published", "draft"].map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setPage(1);
              }}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                statusFilter === status
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-purple-200/50 hover:text-purple-200 hover:bg-white/5"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="relative max-w-sm w-full">
          <input
            type="text"
            placeholder="Search posts..."
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

      {/* Table */}
      <div className="glass-card overflow-hidden rounded-2xl border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="p-4 text-purple-200 font-medium text-sm">
                  Title
                </th>
                <th className="p-4 text-purple-200 font-medium text-sm">
                  Status
                </th>
                <th className="p-4 text-purple-200 font-medium text-sm">
                  Categories
                </th>
                <th className="p-4 text-purple-200 font-medium text-sm">
                  Date
                </th>
                <th className="p-4 text-purple-200 font-medium text-sm text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-purple-200/50"
                  >
                    <div className="flex justify-center mb-2">
                      <div className="w-6 h-6 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                    Loading posts...
                  </td>
                </tr>
              ) : postsData?.data && postsData.data.length > 0 ? (
                postsData.data.map((post) => (
                  <tr
                    key={post.id}
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="p-4 max-w-md">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 shrink-0 border border-white/10">
                          {post.coverImage ? (
                            <img
                              src={post.coverImage}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-purple-200/20">
                              <FileText size={20} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-white font-medium line-clamp-1">
                            {post.title}
                          </div>
                          <div className="text-xs text-purple-200/50 line-clamp-1 font-mono">
                            /{post.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                          post.status === "published"
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                        }`}
                      >
                        {post.status.charAt(0).toUpperCase() +
                          post.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {post.categories?.slice(0, 2).map((cat) => (
                          <span
                            key={cat.id}
                            className="px-2 py-0.5 rounded text-xs bg-purple-500/10 text-purple-300 border border-purple-500/20"
                          >
                            {cat.name}
                          </span>
                        ))}
                        {post.categories && post.categories.length > 2 && (
                          <span className="px-2 py-0.5 rounded text-xs bg-white/5 text-purple-200/50 border border-white/10">
                            +{post.categories.length - 2}
                          </span>
                        )}
                        {(!post.categories || post.categories.length === 0) && (
                          <span className="text-purple-200/30 text-xs">-</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-purple-200/60 text-sm">
                      {format(new Date(post.createdAt), "MMM d, yyyy")}
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
                          <DropdownMenuItem asChild>
                            <Link
                              to={`/admin/posts/${post.id}/edit`}
                              className="cursor-pointer gap-2"
                            >
                              <Edit size={14} />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <a
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="cursor-pointer gap-2"
                            >
                              <Eye size={14} />
                              View Live
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/10" />
                          <DropdownMenuItem
                            className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer gap-2"
                            onClick={() => handleDelete(post.id)}
                            disabled={isDeleting === post.id}
                          >
                            <Trash2 size={14} />
                            {isDeleting === post.id ? "Deleting..." : "Delete"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="p-12 text-center text-purple-200/50"
                  >
                    No posts found.{" "}
                    <Link
                      to="/admin/posts/new"
                      className="text-fuchsia-400 hover:text-fuchsia-300 underline"
                    >
                      Create one?
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {postsData?.pagination && postsData.pagination.totalPages > 1 && (
          <div className="p-4 border-t border-white/10 flex justify-between items-center bg-white/5">
            <span className="text-sm text-purple-200/50">
              Page {page} of {postsData.pagination.totalPages}
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
                    Math.min(postsData.pagination.totalPages, p + 1),
                  )
                }
                disabled={page === postsData.pagination.totalPages}
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
