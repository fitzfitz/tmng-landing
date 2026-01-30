import { useState, useEffect } from "react";
import { format } from "date-fns";

type Tag = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  postCount: number;
};

export default function TagsManager() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({ name: "", slug: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchTags = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/tags");
      const data = await res.json();
      if (data.data) {
        setTags(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      // Only auto-update slug if we're not editing an existing tag (or optional behavior)
      slug: prev.slug === "" || !editingId ? name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") : prev.slug
    }));
  };

  const resetForm = () => {
    setFormData({ name: "", slug: "" });
    setEditingId(null);
    setError("");
  };

  const handleEdit = (tag: Tag) => {
    setFormData({ name: tag.name, slug: tag.slug });
    setEditingId(tag.id);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const url = editingId 
        ? `/api/admin/tags/${editingId}`
        : "/api/admin/tags";
      
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save tag");
      }

      await fetchTags();
      resetForm();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tag?")) return;

    setIsDeleting(id);
    try {
      const res = await fetch(`/api/admin/tags/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete tag");
      }

      // If we deleted the tag we were editing, reset form
      if (editingId === id) {
        resetForm();
      }

      await fetchTags();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form Section */}
      <div className="lg:col-span-1">
        <div className="bg-white/5 rounded-2xl border border-white/10 p-6 sticky top-24">
          <h2 className="text-xl font-bold text-white mb-6">
            {editingId ? "Edit Tag" : "New Tag"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-purple-200">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={handleNameChange}
                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:border-fuchsia-500/50 transition-colors"
                placeholder="e.g. Technology"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-purple-200">Slug</label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:border-fuchsia-500/50 transition-colors font-mono text-sm"
                placeholder="e.g. technology"
              />
              <p className="text-xs text-purple-200/50">
                The literal URL slug for this tag.
              </p>
            </div>

            <div className="pt-4 flex items-center gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : (editingId ? "Update Tag" : "Create Tag")}
              </button>
              
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-purple-200 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* List Section */}
      <div className="lg:col-span-2">
        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-purple-200/70">
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Slug</th>
                  <th className="px-6 py-4 font-medium text-center">Posts</th>
                  <th className="px-6 py-4 font-medium text-right">Created</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-purple-200/50">
                      <div className="inline-block w-6 h-6 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                      <p>Loading tags...</p>
                    </td>
                  </tr>
                ) : tags.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-purple-200/50">
                      No tags found. Create your first one!
                    </td>
                  </tr>
                ) : (
                  tags.map((tag) => (
                    <tr key={tag.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{tag.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-xs bg-black/30 px-2 py-1 rounded text-purple-200/70">
                          {tag.slug}
                        </code>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
                          {tag.postCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-purple-200/50">
                        {format(new Date(tag.createdAt), "MMM d, yyyy")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(tag)}
                            className="p-2 text-purple-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(tag.id)}
                            disabled={isDeleting === tag.id}
                            className="p-2 text-purple-200 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            {isDeleting === tag.id ? (
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
