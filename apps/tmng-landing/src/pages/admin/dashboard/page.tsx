import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/endpoints";
import {
  FileText,
  Eye,
  Users,
  MessageSquare,
  Plus,
  List,
  Tags,
} from "lucide-react";
import { Link } from "react-router-dom";

interface DashboardStats {
  posts: number;
  views: number;
  subscribers: number;
  contacts: number;
}

export default function AdminDashboardPage() {
  const {
    data: stats,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.STATS);
      return response.data.data as DashboardStats;
    },
  });

  const displayStats = {
    posts: stats?.posts ?? "-",
    views: stats?.views ?? "-",
    subscribers: stats?.subscribers ?? "-",
    contacts: stats?.contacts ?? "-",
  };

  if (isError) {
    return (
      <div className="text-red-400 p-4 border border-red-500/20 bg-red-500/10 rounded-xl">
        Failed to load dashboard statistics.
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-purple-200/60">
          Here's what's happening with your content today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Posts */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-600/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {isLoading ? (
              <span className="animate-pulse">...</span>
            ) : (
              displayStats.posts
            )}
          </div>
          <div className="text-purple-200/60 text-sm">Total Posts</div>
        </div>

        {/* Total Views */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-fuchsia-600/20 flex items-center justify-center">
              <Eye className="w-6 h-6 text-fuchsia-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {isLoading ? (
              <span className="animate-pulse">...</span>
            ) : (
              displayStats.views
            )}
          </div>
          <div className="text-purple-200/60 text-sm">Total Views</div>
        </div>

        {/* Subscribers */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-600/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {isLoading ? (
              <span className="animate-pulse">...</span>
            ) : (
              displayStats.subscribers
            )}
          </div>
          <div className="text-purple-200/60 text-sm">Subscribers</div>
        </div>

        {/* New Messages */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-600/20 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {isLoading ? (
              <span className="animate-pulse">...</span>
            ) : (
              displayStats.contacts
            )}
          </div>
          <div className="text-purple-200/60 text-sm">New Messages</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/admin/posts/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-fuchsia-600 text-white font-medium rounded-xl hover:bg-fuchsia-700 transition-colors shadow-lg shadow-fuchsia-500/20"
          >
            <Plus className="w-5 h-5" />
            New Post
          </Link>
          <Link
            to="/admin/posts"
            className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-800 border border-white/10 text-white font-medium rounded-xl hover:bg-zinc-700 transition-colors"
          >
            <List className="w-5 h-5" />
            Manage Posts
          </Link>
          <Link
            to="/admin/categories"
            className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-800 border border-white/10 text-white font-medium rounded-xl hover:bg-zinc-700 transition-colors"
          >
            <Tags className="w-5 h-5" />
            Categories
          </Link>
        </div>
      </div>
    </div>
  );
}
