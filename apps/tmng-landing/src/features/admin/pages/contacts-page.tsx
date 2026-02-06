import { AdminPageWrapper } from "../admin-page-wrapper";
import ContactsManager from "../contacts-manager";

export function ContactsPage() {
  return (
    <AdminPageWrapper currentPath="/admin/contacts">
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-purple-200">
             Contacts
          </h1>
          <p className="text-purple-200/50 mt-2">View contact form submissions.</p>
        </div>
        <ContactsManager />
      </div>
    </AdminPageWrapper>
  );
}
