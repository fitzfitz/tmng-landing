import { AdminPageWrapper } from "../admin-page-wrapper";
import PostsTable from "../posts-table";

export function PostsPage() {
  return (
    <AdminPageWrapper currentPath="/admin/posts">
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-purple-200">
              Posts
            </h1>
            <p className="text-purple-200/50 mt-2">Manage your blog posts.</p>
          </div>
          <a
            href="/admin/posts/new"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white text-sm font-medium transition-colors"
          >
            New Post
          </a>
        </div>
        <PostsTable />
      </div>
    </AdminPageWrapper>
  );
}
