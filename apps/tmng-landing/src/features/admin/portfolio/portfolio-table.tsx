import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { api } from "@/utils/api-client";
import { MoreVertical, Edit, Trash, ExternalLink } from "lucide-react";
import type { PortfolioItem } from "@/types"; // Need to check if this type exists or define it

export function PortfolioTable() {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-portfolio"],
    queryFn: async () => {
      const res = await api.get("/admin/portfolio");
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!confirm("Are you sure you want to delete this project?")) return;
      await api.delete(`/admin/portfolio/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-portfolio"] });
    },
  });

  const items = data?.data || [];

  const filteredItems = items.filter((item: any) => {
    if (filterStatus === "all") return true;
    return item.status === filterStatus;
  });

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading projects...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Projects ({filteredItems.length})</h2>
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          <Button asChild>
            <a href="/admin/portfolio/new">Add Project</a>
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Project</th>
              <th className="px-6 py-4">Client</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredItems.map((item: any) => (
              <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {item.coverImage && (
                      <img src={item.coverImage} alt="" className="w-10 h-10 rounded-md object-cover border border-gray-200" />
                    )}
                    <div>
                      <div className="font-medium text-gray-900">{item.title}</div>
                      <div className="text-gray-500 text-xs">/{item.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">{item.client || "-"}</td>
                <td className="px-6 py-4 text-gray-600">
                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">
                    {item.category || "Uncategorized"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                    item.status === 'published' 
                      ? "bg-green-50 text-green-700 ring-1 ring-green-600/10" 
                      : "bg-amber-50 text-amber-700 ring-1 ring-amber-600/10"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'published' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                    {item.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {format(new Date(item.createdAt), "MMM d, yyyy")}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-gray-400 hover:text-purple-600">
                       <a href={`/admin/portfolio/${item.id}`}><Edit className="w-4 h-4" /></a>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-gray-400 hover:text-red-600"
                      onClick={() => deleteMutation.mutate(item.id)}
                    >
                       <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
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
