import { useState } from "react";
import { Plus } from "lucide-react";
import {
  useCreateProject,
  useUpdateProject,
  Project,
  CreateProjectInput,
  UpdateProjectInput,
} from "../api/use-portfolio";
import { ProjectsTable } from "./projects-table";
import { ProjectModal } from "./project-modal";

export function ProjectsManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>(
    undefined,
  );

  const createProject = useCreateProject();
  const updateProject = useUpdateProject();

  const handleCreate = () => {
    setEditingProject(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleSubmit = async (
    data: CreateProjectInput | UpdateProjectInput,
  ) => {
    try {
      if (editingProject) {
        await updateProject.mutateAsync({
          id: editingProject.id,
          data: data as UpdateProjectInput,
        });
      } else {
        await createProject.mutateAsync(data as CreateProjectInput);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save project:", error);
      // You might want to show a toast notification here
      alert("Failed to save project");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Portfolio
          </h1>
          <p className="text-purple-200/60 mt-2">
            Manage your portfolio projects and case studies.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-lg font-medium transition-all hover:scale-105 active:scale-95 shadow-lg shadow-fuchsia-500/20"
        >
          <Plus size={18} />
          Add Project
        </button>
      </div>

      <ProjectsTable onEdit={handleEdit} />

      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        project={editingProject}
        onSubmit={handleSubmit}
        isSubmitting={createProject.isPending || updateProject.isPending}
      />
    </div>
  );
}
