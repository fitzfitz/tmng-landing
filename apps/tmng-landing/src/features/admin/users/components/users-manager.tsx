import { useState } from "react";
import { Plus } from "lucide-react";
import { UsersTable } from "./users-table";
import { UserModal } from "./user-modal";
import {
  useCreateUser,
  useUpdateUser,
  User,
  CreateUserInput,
  UpdateUserInput,
} from "../api/use-users";

export function UsersManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const handleCreate = () => {
    setEditingUser(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingUser(undefined);
  };

  const handleSubmit = async (data: CreateUserInput | UpdateUserInput) => {
    try {
      if (editingUser) {
        await updateUser.mutateAsync({
          id: editingUser.id,
          data: data as UpdateUserInput,
        });
      } else {
        await createUser.mutateAsync(data as CreateUserInput);
      }
      handleModalClose();
    } catch (error) {
      console.error("Failed to save user:", error);
      alert("Failed to save user");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Users</h2>
          <p className="text-purple-200/60">Manage system users and roles</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-fuchsia-600/20"
        >
          <Plus size={20} />
          Add User
        </button>
      </div>

      <UsersTable onEdit={handleEdit} />

      <UserModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        user={editingUser}
        onSubmit={handleSubmit}
        isSubmitting={createUser.isPending || updateUser.isPending}
      />
    </div>
  );
}
