import { QueryProvider } from "@/providers/query-provider";
import AdminLayout from "./admin-layout";
import type { ReactNode } from "react";

interface AdminPageWrapperProps {
  children: ReactNode;
  currentPath?: string;
}

/**
 * Wrapper component that provides TanStack Query context to admin pages
 * Use this to wrap all admin page components
 */
export function AdminPageWrapper({ children, currentPath }: AdminPageWrapperProps) {
  return (
    <QueryProvider>
      <AdminLayout currentPath={currentPath}>
        {children}
      </AdminLayout>
    </QueryProvider>
  );
}
