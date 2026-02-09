import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  Category,
} from "../api/use-categories";
import { Modal } from "@/components/ui/modal";
import { Plus, Search, MoreVertical, Edit, Trash2, Tags } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function CategoriesManager() {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const { data: categoriesData, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Category>({
    defaultValues: {
      name: "",
      slug: "",
      color: "#a855f7",
      description: "",
    },
  });

  const filteredCategories = categoriesData?.data?.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase()),
  );

  const onSubmit = async (data: Category) => {
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, data });
      } else {
        await createCategory.mutateAsync(data);
      }
      closeModal();
    } catch (error) {
      alert("Failed to save category");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteCategory.mutateAsync(id);
      } catch (error) {
        alert("Failed to delete category");
      }
    }
  };

  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      reset({
        name: category.name,
        slug: category.slug,
        color: category.color,
        description: category.description || "",
      });
    } else {
      setEditingCategory(null);
      reset({
        name: "",
        slug: "",
        color: "#a855f7",
        description: "",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    reset();
  };

  // Auto-slug
  const name = watch("name");
  useEffect(() => {
    if (!editingCategory && name) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setValue("slug", slug);
    }
  }, [name, editingCategory, setValue]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Categories</h1>
          <p className="text-purple-200/50 text-sm">
            Organize content with categories
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl transition-colors font-medium shadow-lg shadow-fuchsia-600/20"
        >
          <Plus size={18} />
          New Category
        </button>
      </div>

      <div className="flex justify-between items-center bg-white/5 p-1 rounded-xl border border-white/10">
        <div className="relative w-full md:max-w-xs">
          <input
            type="text"
            placeholder="Search categories..."
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-purple-200/50">
            Loading...
          </div>
        ) : filteredCategories && filteredCategories.length > 0 ? (
          filteredCategories.map((category) => (
            <div
              key={category.id}
              className="glass-card p-6 rounded-2xl border border-white/10 group hover:border-purple-500/30 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: category.color }}
                >
                  {category.name.charAt(0).toUpperCase()}
                </div>
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
                      onClick={() => openModal(category)}
                      className="cursor-pointer gap-2"
                    >
                      <Edit size={14} />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem
                      className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer gap-2"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 size={14} />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                {category.name}
              </h3>
              <p className="text-sm text-purple-200/50 font-mono mb-3">
                /{category.slug}
              </p>
              {category.description && (
                <p className="text-sm text-purple-200/70 line-clamp-2 mb-4 h-10">
                  {category.description}
                </p>
              )}
              <div className="flex items-center gap-2 text-xs text-purple-200/50 border-t border-white/10 pt-4 mt-auto">
                <Tags size={14} />
                {category.postCount || 0} posts
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-purple-200/50">
            No categories found.
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingCategory ? "Edit Category" : "New Category"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-purple-200/70 mb-1">
              Name
            </label>
            <input
              {...register("name", { required: "Name is required" })}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-500/50"
              placeholder="e.g. Technology"
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
              placeholder="technology"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-purple-200/70 mb-1">
              Color
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                {...register("color")}
                className="w-10 h-10 rounded border border-white/10 bg-black/20 cursor-pointer"
              />
              <input
                type="text"
                {...register("color")}
                className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-purple-200 focus:outline-none focus:border-fuchsia-500/50"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-purple-200/70 mb-1">
              Description
            </label>
            <textarea
              {...register("description")}
              rows={3}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-purple-200 focus:outline-none focus:border-fuchsia-500/50 resize-none"
              placeholder="Optional description..."
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
              {editingCategory ? "Update Category" : "Create Category"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
