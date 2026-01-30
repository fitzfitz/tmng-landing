import { useState, useEffect } from "react";
import { marked } from "marked";
import ImageUploader from "./image-uploader";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  status: "draft" | "published" | "archived";
  isFeatured: boolean;
  readTimeMinutes: number;
  categories: string[];
};

type Category = {
  id: string;
  name: string;
};

interface PostEditorProps {
  initialData?: Post;
  isNew?: boolean;
}

export default function PostEditor({ initialData, isNew = false }: PostEditorProps) {
  const [formData, setFormData] = useState<Partial<Post>>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    status: "draft",
    isFeatured: false,
    readTimeMinutes: 5,
    categories: [],
    ...initialData,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewHtml, setPreviewHtml] = useState("");
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

  // Fetch categories on mount
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setCategories(data.data);
        }
      })
      .catch((err) => console.error("Failed to load categories", err));
  }, []);

  // Update preview when content changes or tab switches
  useEffect(() => {
    if (activeTab === "preview" && formData.content) {
      const html = marked.parse(formData.content, { async: false });
       if (typeof html === 'string') {
          setPreviewHtml(html);
       } else {
        // Handle promise if async is true (though we set async: false)
        Promise.resolve(html).then(h => setPreviewHtml(h));
       }
    }
  }, [formData.content, activeTab]);

  // Auto-generate slug from title if new
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    if (isNew && !formData.slug) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setFormData((prev) => ({ ...prev, title, slug }));
    } else {
      setFormData((prev) => ({ ...prev, title }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const formDataToSend = new FormData();
      
      // Append standard fields
      Object.keys(formData).forEach(key => {
        const val = (formData as any)[key];
        
        if (key === 'categories' && Array.isArray(val)) {
          // Append each category separately
          val.forEach((catId: string) => {
             formDataToSend.append('categories', catId);
          });
        } else if (val !== undefined && val !== null) {
          // Convert booleans/numbers to string
          formDataToSend.append(key, String(val));
        }
      });

      // Append file if selected
      if (selectedFile) {
        formDataToSend.append("coverImageFile", selectedFile);
        // We can also send the key "coverImage" as empty or the existing value, 
        // back-end handles precedence.
      }

      const url = isNew ? "/api/admin/posts" : `/api/admin/posts/${initialData!.id}`;
      const method = isNew ? "POST" : "PUT";

      // Note: Do NOT set Content-Type header when sending FormData, 
      // browser sets it with boundary automatically.
      const res = await fetch(url, {
        method,
        body: formDataToSend,
      });

      const result = await res.json();

      if (!res.ok) {
        // Handle validation errors nicely
        if (result.issues) {
           const messages = result.issues.map((i: any) => `${i.path.join('.')}: ${i.message}`).join('\n');
           throw new Error(messages);
        }
        throw new Error(result.error || "Failed to save post");
      }

      alert("Post saved successfully!");
      if (isNew) {
        window.location.href = `/admin/posts/${result.data.id}/edit`;
      }
    } catch (error: any) {
      console.error("Save error:", error);
      alert(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleCategory = (catId: string) => {
    setFormData((prev) => {
      const current = prev.categories || [];
      const updated = current.includes(catId)
        ? current.filter((id) => id !== catId)
        : [...current, catId];
      return { ...prev, categories: updated };
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Top Bar: Title & Actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex-1 w-full">
          <input
            type="text"
            placeholder="Post Title"
            className="w-full bg-transparent text-3xl md:text-4xl font-bold text-white placeholder-purple-200/20 border-none focus:ring-0 px-0"
            value={formData.title}
            onChange={handleTitleChange}
            required
          />
          <div className="flex items-center gap-2 mt-2 text-purple-200/50 text-sm">
            <span>Slug:</span>
            <input
              type="text"
              className="bg-transparent border-b border-white/10 focus:border-fuchsia-500/50 focus:outline-none text-purple-200"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
            />
          </div>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <a
            href="/admin/posts"
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-purple-200 rounded-xl transition-colors font-medium"
          >
            Cancel
          </a>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl transition-colors font-medium shadow-lg shadow-fuchsia-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              isNew ? "Create Post" : "Update Post"
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Excerpt */}
          <div className="glass-card p-4 rounded-2xl">
            <label className="block text-sm font-medium text-purple-200/70 mb-2">Excerpt</label>
            <textarea
              className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-purple-100 focus:outline-none focus:border-fuchsia-500/50 min-h-[80px]"
              placeholder="Brief summary of the post..."
              value={formData.excerpt || ""}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            />
          </div>

          {/* Editor */}
          <div className="glass-card rounded-2xl overflow-hidden flex flex-col min-h-[600px]">
            <div className="flex border-b border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab("write")}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === "write"
                    ? "bg-white/5 text-fuchsia-300 border-b-2 border-fuchsia-500"
                    : "text-purple-200/50 hover:text-purple-200 hover:bg-white/5"
                }`}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === "preview"
                    ? "bg-white/5 text-fuchsia-300 border-b-2 border-fuchsia-500"
                    : "text-purple-200/50 hover:text-purple-200 hover:bg-white/5"
                }`}
              >
                Preview
              </button>
            </div>
            
            <div className="flex-1 relative">
              {activeTab === "write" ? (
                <textarea
                  className="absolute inset-0 w-full h-full bg-transparent p-6 text-purple-100 resize-none focus:outline-none font-mono text-sm leading-relaxed"
                  placeholder="Write your post content in Markdown..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                />
              ) : (
                <div 
                  className="absolute inset-0 w-full h-full overflow-y-auto p-6 prose prose-invert prose-purple max-w-none"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          {/* Status & Visibility */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="font-semibold text-white">Publishing</h3>
            
            <div>
              <label className="block text-sm font-medium text-purple-200/70 mb-2">Status</label>
              <select
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-purple-200 focus:outline-none focus:border-fuchsia-500/50"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-purple-200/70">Featured Post</label>
              <input
                type="checkbox"
                className="w-5 h-5 rounded border-white/20 bg-black/20 text-fuchsia-600 focus:ring-fuchsia-500 focus:ring-offset-0"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-200/70 mb-2">Read Time (min)</label>
              <input
                type="number"
                min="1"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-purple-200 focus:outline-none focus:border-fuchsia-500/50"
                value={formData.readTimeMinutes}
                onChange={(e) => setFormData({ ...formData, readTimeMinutes: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>

          {/* Categories */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="font-semibold text-white">Categories</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {categories.length === 0 ? (
                 <p className="text-sm text-purple-200/50 italic">No categories found.</p>
              ) : (
                categories.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-white/20 bg-black/20 text-fuchsia-600 focus:ring-fuchsia-500 focus:ring-offset-0"
                      checked={formData.categories?.includes(cat.id)}
                      onChange={() => toggleCategory(cat.id)}
                    />
                    <span className="text-sm text-purple-200">{cat.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Cover Image */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="font-semibold text-white">Cover Image</h3>
            <div>
              <ImageUploader 
                currentImage={formData.coverImage}
                onFileSelect={(file) => {
                  setSelectedFile(file);
                  // Clear string URL if file is selected, to prioritize file upload
                  if (file) {
                    setFormData({ ...formData, coverImage: "" }); 
                  }
                }}
              />
              <div className="mt-3">
                <label className="block text-xs font-medium text-purple-200/50 mb-1">Or enter URL manually (relative or absolute)</label>
                <input
                  type="text"
                  placeholder="/uploads/... or https://..."
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-purple-200 focus:outline-none focus:border-fuchsia-500/50"
                  value={formData.coverImage || ""}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                />
              </div>
            </div>
          </div>
          
           {/* SEO Settings */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="font-semibold text-white">SEO Settings</h3>
             <div>
              <label className="block text-sm font-medium text-purple-200/70 mb-2">Meta Title</label>
              <input
                type="text"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-purple-200 focus:outline-none focus:border-fuchsia-500/50"
                placeholder={formData.title}
                value={(formData as any).seoTitle || ""}
                onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value } as any)}
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-purple-200/70 mb-2">Meta Description</label>
              <textarea
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-purple-200 focus:outline-none focus:border-fuchsia-500/50 min-h-[80px]"
                value={(formData as any).seoDescription || ""}
                onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value } as any)}
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
