import { AdminPageWrapper } from "../admin-page-wrapper";
import CategoriesManager from "../categories-manager";

export function CategoriesPage() {
  return (
    <AdminPageWrapper currentPath="/admin/categories">
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
            Categories
          </h1>
          <p className="text-purple-200/70 mt-2">
            Manage Categories.
          </p>
        </div>
        <CategoriesManager />
      </div>
    </AdminPageWrapper>
  );
}
