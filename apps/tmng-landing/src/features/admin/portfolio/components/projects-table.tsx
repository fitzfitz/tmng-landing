import { useState } from "react";
import {
  MoreVertical,
  Edit,
  Trash2,
  ExternalLink,
  Eye,
  Github,
  Star,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { usePortfolio, useDeleteProject, Project } from "../api/use-portfolio";

interface ProjectsTableProps {
  onEdit: (project: Project) => void;
}

export function ProjectsTable({ onEdit }: ProjectsTableProps) {
  const { data: projects, isLoading } = usePortfolio();
  const deleteProject = useDeleteProject();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      setIsDeleting(id);
      try {
        await deleteProject.mutateAsync(id);
      } catch (error) {
        console.error("Failed to delete project:", error);
        alert("Failed to delete project");
      } finally {
        setIsDeleting(null);
      }
    }
  };

  return (
    <div className="glass-card overflow-hidden rounded-2xl border border-white/10">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="p-4 text-purple-200 font-medium text-sm">
                Project
              </th>
              <th className="p-4 text-purple-200 font-medium text-sm">
                Status
              </th>
              <th className="p-4 text-purple-200 font-medium text-sm">Stats</th>
              <th className="p-4 text-purple-200 font-medium text-sm text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-purple-200/50">
                  <div className="flex justify-center mb-2">
                    <div className="w-6 h-6 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                  Loading projects...
                </td>
              </tr>
            ) : projects && projects.length > 0 ? (
              projects.map((project) => (
                <tr
                  key={project.id}
                  className="hover:bg-white/5 transition-colors group"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-white/5 shrink-0 border border-white/10 overflow-hidden">
                        {project.coverImage ? (
                          <img
                            src={project.coverImage}
                            alt={project.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-purple-200/20">
                            <Star size={20} />
                          </div>
                        )}
                      </div>
                      <div>
                        <div
                          className="text-white font-medium flex items-center gap-2 cursor-pointer hover:text-fuchsia-400 transition-colors"
                          onClick={() => onEdit(project)}
                        >
                          {project.title}
                          {project.isFeatured && (
                            <Star
                              size={12}
                              className="text-yellow-400 fill-yellow-400"
                            />
                          )}
                        </div>
                        <div className="text-xs text-purple-200/50">
                          {project.client || "Personal Project"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                        project.status === "published"
                          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                          : "bg-yellow-500/10 text-yellow-300 border-yellow-500/20"
                      }`}
                    >
                      {project.status === "published" ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-4 text-xs text-purple-200/60">
                      <div className="flex items-center gap-1" title="Views">
                        <Eye size={14} />
                        {project.viewCount || 0}
                      </div>
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-white transition-colors"
                          title="View Live"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                      {project.repoUrl && (
                        <a
                          href={project.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-white transition-colors"
                          title="View Code"
                        >
                          <Github size={14} />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2 text-purple-200/50 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
                          <MoreVertical size={18} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-black/90 border-white/10 text-purple-100 backdrop-blur-xl"
                      >
                        <DropdownMenuItem
                          onClick={() => onEdit(project)}
                          className="cursor-pointer gap-2"
                        >
                          <Edit size={14} />
                          Edit Project
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem
                          className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer gap-2"
                          onClick={() => handleDelete(project.id)}
                          disabled={isDeleting === project.id}
                        >
                          <Trash2 size={14} />
                          {isDeleting === project.id ? "Deleting..." : "Delete"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-12 text-center text-purple-200/50">
                  No projects found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
