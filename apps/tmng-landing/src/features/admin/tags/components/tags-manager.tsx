import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  useTags,
  useCreateTag,
  useUpdateTag,
  useDeleteTag,
  Tag,
} from "../api/use-tags";
import { Modal } from "@/components/ui/modal";
import { Plus, Search, MoreVertical, Edit, Trash2, Hash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function TagsManager() {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  const { data: tagsData, isLoading } = useTags();
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Tag>({
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  const filteredTags = tagsData?.data?.filter((tag) =>
    tag.name.toLowerCase().includes(search.toLowerCase()),
  );

  const onSubmit = async (data: Tag) => {
    try {
      if (editingTag) {
        await updateTag.mutateAsync({ id: editingTag.id, data });
      } else {
        await createTag.mutateAsync(data);
      }
      closeModal();
    } catch (error) {
      alert("Failed to save tag");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this tag?")) {
      try {
        await deleteTag.mutateAsync(id);
      } catch (error) {
        alert("Failed to delete tag");
      }
    }
  };

  const openModal = (tag?: Tag) => {
    if (tag) {
      setEditingTag(tag);
      reset({
        name: tag.name,
        slug: tag.slug,
      });
    } else {
      setEditingTag(null);
      reset({
        name: "",
        slug: "",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTag(null);
    reset();
  };

  // Auto-slug
  const name = watch("name");
  useEffect(() => {
    if (!editingTag && name) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setValue("slug", slug);
    }
  }, [name, editingTag, setValue]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tags</h1>
          <p className="text-purple-200/50 text-sm">Manage post tags</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl transition-colors font-medium shadow-lg shadow-fuchsia-600/20"
        >
          <Plus size={18} />
          New Tag
        </button>
      </div>

      <div className="flex justify-between items-center bg-white/5 p-1 rounded-xl border border-white/10">
        <div className="relative w-full md:max-w-xs">
          <input
            type="text"
            placeholder="Search tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border-none px-4 py-2 pl-10 text-white focus:outline-none placeholder-purple-200/30"
          />
          <Search
            className="absolute left-3 top-2.5 text-purple-200/50"
            size={18}
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="p-4 text-purple-200 font-medium text-sm">Tag</th>
              <th className="p-4 text-purple-200 font-medium text-sm">Slug</th>
              <th className="p-4 text-purple-200 font-medium text-sm">Posts</th>
              <th className="p-4 text-purple-200 font-medium text-sm text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-purple-200/50">
                  Loading...
                </td>
              </tr>
            ) : filteredTags && filteredTags.length > 0 ? (
              filteredTags.map((tag) => (
                <tr key={tag.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 font-medium">
                      <Hash size={14} />
                      {tag.name}
                    </span>
                  </td>
                  <td className="p-4 text-purple-200/60 font-mono text-sm">
                    {tag.slug}
                  </td>
                  <td className="p-4 text-purple-200/60 text-sm">
                    {tag.postCount || 0}
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
                          onClick={() => openModal(tag)}
                          className="cursor-pointer gap-2"
                        >
                          <Edit size={14} />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem
                          className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer gap-2"
                          onClick={() => handleDelete(tag.id)}
                        >
                          <Trash2 size={14} />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-8 text-center text-purple-200/50">
                  No tags found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingTag ? "Edit Tag" : "New Tag"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-purple-200/70 mb-1">
              Name
            </label>
            <input
              {...register("name", { required: "Name is required" })}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-500/50"
              placeholder="e.g. Next.js"
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-purple-200/70 mb-1">
              Slug
            </label>
            <input
              {...register("slug", { required: "Slug is required" })}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm font-mono text-purple-200 focus:outline-none focus:border-fuchsia-500/50"
              placeholder="next-js"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 rounded-lg text-purple-200 hover:text-white hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl font-medium shadow-lg shadow-fuchsia-600/20 transition-colors"
            >
              {editingTag ? "Update Tag" : "Create Tag"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
