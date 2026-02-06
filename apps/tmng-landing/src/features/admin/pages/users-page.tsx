import { AdminPageWrapper } from "../admin-page-wrapper";
import UsersManager from "../users-manager";

export function UsersPage() {
  return (
    <AdminPageWrapper currentPath="/admin/users">
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-purple-200">
            Users
          </h1>
          <p className="text-purple-200/50 mt-2">Manage users and permissions.</p>
        </div>
        <UsersManager />
      </div>
    </AdminPageWrapper>
  );
}
