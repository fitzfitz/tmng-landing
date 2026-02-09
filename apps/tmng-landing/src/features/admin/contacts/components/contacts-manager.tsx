import { useState } from "react";
import {
  useContacts,
  useDeleteContact,
  useUpdateContactStatus,
  ContactSubmission,
} from "../api/use-contacts";
import { Modal } from "@/components/ui/modal";
import { format } from "date-fns";
import {
  Search,
  CheckCircle,
  Archive,
  MessageSquare,
  Trash2,
} from "lucide-react";

export function ContactsManager() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedContact, setSelectedContact] =
    useState<ContactSubmission | null>(null);

  const { data: contactsData, isLoading } = useContacts({
    page,
    limit: 10,
    search,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const deleteContact = useDeleteContact();
  const updateStatus = useUpdateContactStatus();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this message?")) {
      setIsDeleting(id);
      try {
        await deleteContact.mutateAsync(id);
        if (selectedContact?.id === id) setSelectedContact(null);
      } catch (error) {
        alert("Failed to delete contact");
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const handleStatusUpdate = async (
    id: string,
    status: ContactSubmission["status"],
  ) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      if (selectedContact?.id === id) {
        setSelectedContact((prev) => (prev ? { ...prev, status } : null));
      }
    } catch (error) {
      console.error("Failed to update status");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const openContact = (contact: ContactSubmission) => {
    setSelectedContact(contact);
    if (contact.status === "new") {
      handleStatusUpdate(contact.id, "read");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20";
      case "read":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "replied":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "archived":
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
      default:
        return "bg-white/5 text-gray-400 border-white/10";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Messages</h1>
          <p className="text-purple-200/50 text-sm">
            Manage contact form submissions
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10 w-fit overflow-x-auto">
          {["all", "new", "read", "replied", "archived"].map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setPage(1);
              }}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                statusFilter === status
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-purple-200/50 hover:text-purple-200 hover:bg-white/5"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search messages..."
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
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="p-4 text-purple-200 font-medium text-sm">From</th>
              <th className="p-4 text-purple-200 font-medium text-sm">
                Subject
              </th>
              <th className="p-4 text-purple-200 font-medium text-sm">
                Status
              </th>
              <th className="p-4 text-purple-200 font-medium text-sm">Date</th>
              <th className="p-4 text-purple-200 font-medium text-sm text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-purple-200/50">
                  Loading...
                </td>
              </tr>
            ) : contactsData?.data && contactsData.data.length > 0 ? (
              contactsData.data.map((contact) => (
                <tr
                  key={contact.id}
                  onClick={() => openContact(contact)}
                  className={`cursor-pointer transition-colors ${
                    selectedContact?.id === contact.id
                      ? "bg-fuchsia-500/10"
                      : "hover:bg-white/5"
                  } ${contact.status === "new" ? "bg-white/[0.02]" : ""}`}
                >
                  <td className="p-4">
                    <div className="font-medium text-white">{contact.name}</div>
                    <div className="text-sm text-purple-200/50">
                      {contact.email}
                    </div>
                  </td>
                  <td className="p-4 text-purple-100 max-w-xs truncate">
                    {contact.subject}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        contact.status,
                      )}`}
                    >
                      {contact.status.charAt(0).toUpperCase() +
                        contact.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-4 text-purple-200/60 text-sm">
                    {format(new Date(contact.createdAt), "MMM d, yyyy")}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={(e) => handleDelete(contact.id, e)}
                      disabled={isDeleting === contact.id}
                      className="p-2 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-purple-200/50">
                  No messages found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {contactsData?.pagination && contactsData.pagination.totalPages > 1 && (
          <div className="p-4 border-t border-white/10 flex justify-between items-center bg-white/5">
            <span className="text-sm text-purple-200/50">
              Page {page} of {contactsData.pagination.totalPages}
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
                    Math.min(contactsData.pagination.totalPages, p + 1),
                  )
                }
                disabled={page === contactsData.pagination.totalPages}
                className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-purple-200 disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      <Modal
        isOpen={!!selectedContact}
        onClose={() => setSelectedContact(null)}
        title="Message Details"
        className="max-w-2xl"
      >
        {selectedContact && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <label className="text-xs text-purple-200/50 uppercase font-bold tracking-wider mb-1 block">
                  From
                </label>
                <div className="text-white font-medium">
                  {selectedContact.name}
                </div>
                <div className="text-purple-200/70 text-sm">
                  {selectedContact.email}
                </div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <label className="text-xs text-purple-200/50 uppercase font-bold tracking-wider mb-1 block">
                  Sent on
                </label>
                <div className="text-white font-medium">
                  {format(
                    new Date(selectedContact.createdAt),
                    "MMM d, yyyy h:mm a",
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                      selectedContact.status,
                    )}`}
                  >
                    {selectedContact.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <label className="text-xs text-purple-200/50 uppercase font-bold tracking-wider mb-2 block">
                Subject
              </label>
              <h3 className="text-lg font-semibold text-white mb-4">
                {selectedContact.subject}
              </h3>
              <div className="border-t border-white/10 pt-4">
                <label className="text-xs text-purple-200/50 uppercase font-bold tracking-wider mb-2 block">
                  Message
                </label>
                <p className="text-purple-100 whitespace-pre-wrap leading-relaxed">
                  {selectedContact.message}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-white/10">
              <div className="flex gap-2">
                {selectedContact.status !== "replied" && (
                  <button
                    onClick={() =>
                      handleStatusUpdate(selectedContact.id, "replied")
                    }
                    className="flex items-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors text-sm font-medium"
                  >
                    <CheckCircle size={16} />
                    Mark as Replied
                  </button>
                )}
                {selectedContact.status !== "archived" && (
                  <button
                    onClick={() =>
                      handleStatusUpdate(selectedContact.id, "archived")
                    }
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-purple-200 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Archive size={16} />
                    Archive
                  </button>
                )}
              </div>
              <a
                href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`}
                className="flex items-center gap-2 px-6 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl transition-colors font-medium shadow-lg shadow-fuchsia-600/20"
              >
                <MessageSquare size={16} />
                Reply via Email
              </a>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
