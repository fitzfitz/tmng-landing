import { AdminPageWrapper } from "../admin-page-wrapper";
import SubscribersManager from "../subscribers-manager";

export function SubscribersPage() {
  return (
    <AdminPageWrapper currentPath="/admin/subscribers">
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-purple-200">
            Subscribers
          </h1>
          <p className="text-purple-200/50 mt-2">Manage newsletter subscribers.</p>
        </div>
        <SubscribersManager />
      </div>
    </AdminPageWrapper>
  );
}
