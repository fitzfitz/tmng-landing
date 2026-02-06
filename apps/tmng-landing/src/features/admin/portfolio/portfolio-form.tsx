import { useState, useEffect } from "react";
import { marked } from "marked";
import { api } from "@/utils/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Loader2, Eye, FileText } from "lucide-react";

type PortfolioItem = {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  client: string;
  category: string;
  liveUrl: string;
  repoUrl: string;
  coverImage: string;
  status: "draft" | "published";
  isFeatured: boolean;
};

interface PortfolioFormProps {
  initialData?: PortfolioItem;
  isNew?: boolean;
  id?: string;
}

export function PortfolioForm({ initialData, isNew = false, id }: PortfolioFormProps) {
  const [formData, setFormData] = useState<PortfolioItem>({
    title: "",
    slug: "",
    summary: "",
    content: "",
    client: "",
    category: "",
    liveUrl: "",
    repoUrl: "",
    coverImage: "",
    status: "draft",
    isFeatured: false,
    ...initialData,
  });

  const [isLoading, setIsLoading] = useState(!!id && !initialData);

  useEffect(() => {
    if (id && !initialData) {
      setIsLoading(true);
      api.get(`/admin/portfolio/${id}`)
        .then((res) => {
          if (res.data.success) {
            setFormData((prev) => ({ ...prev, ...res.data.data }));
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [id, initialData]);

  if (isLoading) return <div>Loading...</div>;

  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("write");
  const [previewHtml, setPreviewHtml] = useState("");

  useEffect(() => {
    if (activeTab === "preview" && formData.content) {
      const html = marked.parse(formData.content, { async: false });
      if (typeof html === 'string') {
        setPreviewHtml(html);
      } else {
        Promise.resolve(html).then(h => setPreviewHtml(h));
      }
    }
  }, [formData.content, activeTab]);

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
      if (isNew) {
        await api.post("/admin/portfolio", formData);
      } else {
        await api.put(`/admin/portfolio/${initialData?.id}`, formData);
      }
      alert("Project saved successfully!");
      window.location.href = "/admin/portfolio";
    } catch (error: any) {
      console.error("Save error:", error);
      alert("Failed to save project");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <a href="/admin/portfolio">
              <ArrowLeft className="w-5 h-5" />
            </a>
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isNew ? "New Project" : "Edit Project"}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" asChild>
            <a href="/admin/portfolio">Cancel</a>
          </Button>
          <Button type="submit" disabled={isSaving} className="bg-purple-600 hover:bg-purple-700">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Project
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={handleTitleChange}
                  required
                  placeholder="Project Name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="summary">Summary (Short Description)</Label>
                <Textarea
                  id="summary"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  rows={3}
                  placeholder="Brief overview for the card..."
                />
              </div>
            </CardContent>
          </Card>

          <Card className="min-h-[500px] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Case Study Content</CardTitle>
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setActiveTab("write")}
                  className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    activeTab === "write" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <FileText className="w-4 h-4 mr-2" /> Write
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    activeTab === "preview" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <Eye className="w-4 h-4 mr-2" /> Preview
                </button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
               {activeTab === "write" ? (
                 <textarea
                   className="w-full h-full min-h-[400px] p-6 resize-none focus:outline-none font-mono text-sm"
                   placeholder="# Case Study Details..."
                   value={formData.content}
                   onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                 />
               ) : (
                 <div 
                   className="prose max-w-none p-6"
                   dangerouslySetInnerHTML={{ __html: previewHtml }}
                 />
               )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val: any) => setFormData({ ...formData, status: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                />
                <Label htmlFor="isFeatured">Feature on Home Page</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="client">Client</Label>
                <Input
                  id="client"
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  placeholder="Client Name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                   value={formData.category}
                   onValueChange={(val) => setFormData({ ...formData, category: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Web Development">Web Development</SelectItem>
                    <SelectItem value="Mobile App">Mobile App</SelectItem>
                    <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
                    <SelectItem value="Branding">Branding</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="coverImage">Cover Image URL</Label>
                <Input
                  id="coverImage"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="liveUrl">Live Website</Label>
                <Input
                  id="liveUrl"
                  value={formData.liveUrl}
                  onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="repoUrl">Repository</Label>
                <Input
                  id="repoUrl"
                  value={formData.repoUrl}
                  onChange={(e) => setFormData({ ...formData, repoUrl: e.target.value })}
                  placeholder="https://github.com/..."
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
