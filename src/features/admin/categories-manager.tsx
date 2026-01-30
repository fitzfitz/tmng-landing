import { useState, useEffect } from "react";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  sortOrder: number | null;
  postCount?: number;
};

export default function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const initialFormState = {
    name: "",
    slug: "",
    description: "",
    color: "#8B5CF6",
    sortOrder: 0,
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      if (data.data) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    if (!editingId && !formData.slug) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setFormData((prev) => ({ ...prev, name, slug }));
    } else {
      setFormData((prev) => ({ ...prev, name }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const url = editingId 
        ? `/api/admin/categories/${editingId}`
        : "/api/admin/categories";
      
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to save category");
      }

      setFormData(initialFormState);
      setEditingId(null);
      fetchCategories();
      alert(editingId ? "Category updated!" : "Category created!");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      color: category.color || "#8B5CF6",
      sortOrder: category.sortOrder || 0,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData(initialFormState);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will remove the category from all posts.")) return;

    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchCategories();
      } else {
        alert("Failed to delete category");
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form (Left / Top) */}
      <div className="lg:col-span-1">
        <div className="glass-card p-6 rounded-2xl sticky top-24">
          <h2 className="text-xl font-bold text-white mb-6">
            {editingId ? "Edit Category" : "New Category"}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-purple-200/70 mb-1">Name</label>
              <input
                type="text"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-purple-200 focus:outline-none focus:border-fuchsia-500/50"
                value={formData.name}
                onChange={handleNameChange}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-purple-200/70 mb-1">Slug</label>
              <input
                type="text"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-purple-200 focus:outline-none focus:border-fuchsia-500/50"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-200/70 mb-1">Description</label>
              <textarea
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-purple-200 focus:outline-none focus:border-fuchsia-500/50 min-h-[80px]"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-purple-200/70 mb-1">Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    className="h-10 w-10 rounded border border-white/10 bg-transparent cursor-pointer"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  />
                  <input
                    type="text"
                    className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-purple-200 focus:outline-none focus:border-fuchsia-500/50 uppercase"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    maxLength={7}
                  />
                </div>
              </div>
              
              <div className="w-24">
                <label className="block text-sm font-medium text-purple-200/70 mb-1">Order</label>
                <input
                  type="number"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-purple-200 focus:outline-none focus:border-fuchsia-500/50"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-purple-200 rounded-xl transition-colors font-medium"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl transition-colors font-medium shadow-lg shadow-fuchsia-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving ? "Saving..." : (editingId ? "Update" : "Create")}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* List (Right / Bottom) */}
      <div className="lg:col-span-2">
        <div className="glass-card rounded-2xl overflow-hidden border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-purple-200/70">
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Slug</th>
                  <th className="px-6 py-4 font-medium text-right">Posts</th>
                  <th className="px-6 py-4 font-medium text-right">Order</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-purple-200/50">
                      Loading categories...
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-purple-200/50">
                      No categories found. Create one!
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full border border-white/10 shadow-sm"
                            style={{ backgroundColor: cat.color }}
                          />
                          <div className="font-medium text-white">{cat.name}</div>
                        </div>
                        {cat.description && (
                          <div className="mt-1 text-xs text-purple-200/50 truncate max-w-[200px]">
                            {cat.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-purple-200/70 font-mono text-xs">
                        {cat.slug}
                      </td>
                      <td className="px-6 py-4 text-right text-purple-200/70">
                        {cat.postCount}
                      </td>
                      <td className="px-6 py-4 text-right text-purple-200/70">
                        {cat.sortOrder}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEdit(cat)}
                            className="p-2 text-purple-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleDelete(cat.id)}
                            className="p-2 text-purple-200 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
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
