import { QueryProvider } from "@/providers/query-provider";
import { DashboardPage } from "./pages/dashboard-page";

export function DashboardPageWithProvider() {
  return (
    <QueryProvider>
      <DashboardPage />
    </QueryProvider>
  );
}
