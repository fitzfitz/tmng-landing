import { AdminPageWrapper } from "../admin-page-wrapper";
import TagsManager from "../tags-manager";

export function TagsPage() {
  return (
    <AdminPageWrapper currentPath="/admin/tags">
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
            Tags
          </h1>
          <p className="text-purple-200/70 mt-2">
            Manage tags to organize your content.
          </p>
        </div>

        <TagsManager />
      </div>
    </AdminPageWrapper>
  );
}
