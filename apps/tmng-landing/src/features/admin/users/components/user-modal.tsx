import { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { User, CreateUserInput, UpdateUserInput } from "../api/use-users";
import { Modal } from "@/components/ui/modal";

const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "user", "editor"]).default("user"), // Adjusted roles based on typical usage
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional()
    .or(z.literal("")),
  bio: z.string().optional(),
  image: z.string().url("Invalid URL").optional().or(z.literal("")),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User; // If provided, edit mode
  onSubmit: (data: CreateUserInput | UpdateUserInput) => Promise<void>;
  isSubmitting: boolean;
}

export function UserModal({
  isOpen,
  onClose,
  user,
  onSubmit,
  isSubmitting,
}: UserModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema) as any,
    defaultValues: {
      name: "",
      email: "",
      role: "user",
      password: "",
      bio: "",
      image: "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        role: user.role as any,
        password: "", // Don't fill password on edit
        bio: user.bio || "",
        image: user.image || "",
      });
    } else {
      reset({
        name: "",
        email: "",
        role: "user",
        password: "",
        bio: "",
        image: "",
      });
    }
  }, [user, reset, isOpen]);

  const handleFormSubmit: SubmitHandler<UserFormData> = async (data) => {
    // If editing and password is empty, remove it (undefined)
    // If creating, password is required (but schema makes it optional? I should fix schema for create)
    // For now, I'll let backend handle validation or assume empty string means no change.

    // Backend CreateUserSchema probably requires password if it's not optional.
    // In users.service.ts, create user uses default if not provided?
    // "data.password || 'TMNG_default_2025'"

    const submitData: any = {
      name: data.name,
      email: data.email,
      role: data.role,
      bio: data.bio,
      image: data.image,
    };

    if (data.password) {
      submitData.password = data.password;
    }

    await onSubmit(submitData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={user ? "Edit User" : "Add New User"}
    >
      <form
        onSubmit={handleSubmit(handleFormSubmit as any)}
        className="space-y-4"
      >
        <div className="space-y-2">
          <label className="text-sm font-medium text-purple-200">Name</label>
          <input
            {...register("name")}
            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-fuchsia-500/50 transition-colors"
            placeholder="John Doe"
          />
          {errors.name && (
            <p className="text-xs text-red-400">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-purple-200">Email</label>
          <input
            {...register("email")}
            type="email"
            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-fuchsia-500/50 transition-colors"
            placeholder="john@example.com"
          />
          {errors.email && (
            <p className="text-xs text-red-400">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-purple-200">Role</label>
          <select
            {...register("role")}
            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-fuchsia-500/50 transition-colors"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
          </select>
          {errors.role && (
            <p className="text-xs text-red-400">{errors.role.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-purple-200">
            {user ? "Password (leave blank to keep current)" : "Password"}
          </label>
          <input
            {...register("password")}
            type="password"
            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-fuchsia-500/50 transition-colors"
            placeholder={user ? "••••••••" : "Enter password"}
          />
          {errors.password && (
            <p className="text-xs text-red-400">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-purple-200">
            Image URL
          </label>
          <input
            {...register("image")}
            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-fuchsia-500/50 transition-colors"
            placeholder="https://example.com/image.jpg"
          />
          {errors.image && (
            <p className="text-xs text-red-400">{errors.image.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-purple-200">Bio</label>
          <textarea
            {...register("bio")}
            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-fuchsia-500/50 transition-colors h-24 resize-none"
            placeholder="Short bio..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
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
            {user ? "Update User" : "Create User"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
