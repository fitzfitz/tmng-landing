import { useQuery } from "@tanstack/react-query";
import { AdminPageWrapper } from "../admin-page-wrapper";
import apiClient from "@/lib/api-client";
import { ENDPOINTS } from "@/config/endpoints";

function Dashboard() {
  // Use TanStack Query to fetch stats
  const { data: statsData } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const response = await apiClient.get(ENDPOINTS.ADMIN.STATS);
      return response.data.data;
    },
  });

  const stats = {
    posts: { total: statsData?.posts || "-" },
    views: { total: statsData?.views || "-" },
    subscribers: { total: statsData?.subscribers || "-" },
    contacts: { new: statsData?.contacts || "-" }
  };

  return (
    <div className="py-8 px-6">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-white text-3xl font-bold mb-2">
            Dashboard
          </h1>
          <p className="text-gray-400">
            Here's what's happening with your blog today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Stats Card - Total Posts */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-600/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.posts.total}</div>
            <div className="text-gray-400 text-sm">Total Posts</div>
          </div>

          {/* Stats Card - Total Views */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.views.total}</div>
            <div className="text-gray-400 text-sm">Total Views</div>
          </div>

          {/* Stats Card - Subscribers */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.subscribers.total}</div>
            <div className="text-gray-400 text-sm">Subscribers</div>
          </div>

          {/* Stats Card - Contacts */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.contacts.new}</div>
            <div className="text-gray-400 text-sm">New Messages</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-10">
          <h3 className="text-white text-xl font-bold mb-4">
            Quick Actions
          </h3>
          <div className="flex flex-wrap gap-4">
            <a 
              href="/admin/posts/new" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              New Post
            </a>
            <a 
              href="/admin/posts" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-900/20 text-white font-medium rounded-xl hover:bg-purple-900/30 transition-colors"
            >
              Manage Posts
            </a>
            <a 
              href="/admin/categories" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-900/20 text-white font-medium rounded-xl hover:bg-purple-900/30 transition-colors"
            >
              Categories
            </a>
          </div>
        </div>
    </div>
  );
}

export const DashboardPage = () => {
  return (
    <AdminPageWrapper currentPath="/admin">
      <Dashboard />
    </AdminPageWrapper>
  );
};
