import { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
} from "../api/use-portfolio";
import { Modal } from "@/components/ui/modal";

const projectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  summary: z.string().optional(),
  content: z.string().optional(),
  client: z.string().optional(),
  category: z.string().optional(),
  tags: z.string().optional(), // We'll handle comma-separated string for UI
  coverImage: z.string().url("Invalid URL").optional().or(z.literal("")),
  liveUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  repoUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  status: z.enum(["published", "draft"]).default("draft"),
  isFeatured: z.boolean().default(false),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project;
  onSubmit: (data: CreateProjectInput | UpdateProjectInput) => Promise<void>;
  isSubmitting: boolean;
}

export function ProjectModal({
  isOpen,
  onClose,
  project,
  onSubmit,
  isSubmitting,
}: ProjectModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema) as any,
    defaultValues: {
      title: "",
      slug: "",
      summary: "",
      content: "",
      client: "",
      category: "",
      tags: "",
      coverImage: "",
      liveUrl: "",
      repoUrl: "",
      status: "draft",
      isFeatured: false,
    },
  });

  const title = watch("title");

  // Auto-generate slug from title if creating
  useEffect(() => {
    if (!project && title) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setValue("slug", slug);
    }
  }, [title, project, setValue]);

  useEffect(() => {
    if (project) {
      reset({
        title: project.title,
        slug: project.slug,
        summary: project.summary || "",
        content: project.content || "",
        client: project.client || "",
        category: project.category || "",
        tags: project.tags ? project.tags.join(", ") : "",
        coverImage: project.coverImage || "",
        liveUrl: project.liveUrl || "",
        repoUrl: project.repoUrl || "",
        status: project.status,
        isFeatured: project.isFeatured,
      });
    } else {
      reset({
        title: "",
        slug: "",
        summary: "",
        content: "",
        client: "",
        category: "",
        tags: "",
        coverImage: "",
        liveUrl: "",
        repoUrl: "",
        status: "draft",
        isFeatured: false,
      });
    }
  }, [project, reset, isOpen]);

  const handleFormSubmit: SubmitHandler<ProjectFormData> = async (data) => {
    const submitData: any = {
      ...data,
      tags: data.tags
        ? data.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
    };
    await onSubmit(submitData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={project ? "Edit Project" : "Add New Project"}
    >
      <form
        onSubmit={handleSubmit(handleFormSubmit as any)}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-purple-200">Title</label>
            <input
              {...register("title")}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-fuchsia-500/50 transition-colors"
              placeholder="Project Title"
            />
            {errors.title && (
              <p className="text-xs text-red-400">{errors.title.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-purple-200">Slug</label>
            <input
              {...register("slug")}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-fuchsia-500/50 transition-colors"
              placeholder="project-slug"
            />
            {errors.slug && (
              <p className="text-xs text-red-400">{errors.slug.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-purple-200">
              Client
            </label>
            <input
              {...register("client")}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-fuchsia-500/50 transition-colors"
              placeholder="Client Name"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-purple-200">
              Category
            </label>
            <input
              {...register("category")}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-fuchsia-500/50 transition-colors"
              placeholder="Web Development"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-purple-200">
            Tags (comma separated)
          </label>
          <input
            {...register("tags")}
            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-fuchsia-500/50 transition-colors"
            placeholder="React, TypeScript, Tailwind"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-purple-200">
            Cover Image URL
          </label>
          <input
            {...register("coverImage")}
            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-fuchsia-500/50 transition-colors"
            placeholder="https://example.com/image.jpg"
          />
          {errors.coverImage && (
            <p className="text-xs text-red-400">{errors.coverImage.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-purple-200">
              Live URL
            </label>
            <input
              {...register("liveUrl")}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-fuchsia-500/50 transition-colors"
              placeholder="https://project.com"
            />
            {errors.liveUrl && (
              <p className="text-xs text-red-400">{errors.liveUrl.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-purple-200">
              Repo URL
            </label>
            <input
              {...register("repoUrl")}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-fuchsia-500/50 transition-colors"
              placeholder="https://github.com/..."
            />
            {errors.repoUrl && (
              <p className="text-xs text-red-400">{errors.repoUrl.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-purple-200">Summary</label>
          <textarea
            {...register("summary")}
            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-fuchsia-500/50 transition-colors h-20 resize-none"
            placeholder="Brief summary..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-purple-200">Content</label>
          <textarea
            {...register("content")}
            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-fuchsia-500/50 transition-colors h-32 resize-none"
            placeholder="Detailed description..."
          />
        </div>

        <div className="flex items-center gap-6 pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-purple-200 hover:text-white transition-colors">
            <input
              type="checkbox"
              {...register("isFeatured")}
              className="w-5 h-5 rounded border-white/10 bg-black/20 text-fuchsia-600 focus:ring-fuchsia-500/50"
            />
            Featured Project
          </label>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-purple-200">Status:</span>
            <select
              {...register("status")}
              className="bg-black/50 border border-white/10 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-fuchsia-500/50"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-purple-200 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            {project ? "Update Project" : "Create Project"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
