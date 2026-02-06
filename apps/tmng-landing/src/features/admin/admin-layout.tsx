import { 
  LayoutDashboard, 
  FileText, 
  Tags, 
  Users, 
  Mail, 
  UsersRound, 
  LogOut,
  Menu,
  X,
  ChevronUp,
  Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { 
  Popover, 
  PopoverTrigger, 
  PopoverContent, 
} from "@/components/ui/popover";
import { useUser } from "./hooks/use-user";

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPath?: string;
}

const SIDEBAR_ITEMS = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Portfolio",
    href: "/admin/portfolio",
    icon: Briefcase,
  },
  {
    title: "Posts",
    href: "/admin/posts",
    icon: FileText,
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: Tags,
  },
  {
    title: "Tags",
    href: "/admin/tags",
    icon: Tags,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Subscribers",
    href: "/admin/subscribers",
    icon: Mail,
  },
  {
    title: "Contacts",
    href: "/admin/contacts",
    icon: UsersRound,
  },
];

export default function AdminLayout({ children, currentPath }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { data: user, isLoading } = useUser();

  // Helper to check if link is active
  const isActive = (href: string) => {
    if (href === "/admin") {
      return currentPath === "/admin";
    }
    return currentPath?.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-black/95 text-purple-100 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed top-0 lg:sticky inset-y-0 left-0 z-50 w-64 bg-zinc-950/50 border-r border-white/10 backdrop-blur-xl transform transition-transform duration-300 ease-in-out lg:transform-none flex flex-col h-screen",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-fuchsia-400 to-purple-400">
            TMNG Admin
          </h1>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-purple-200/70 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {SIDEBAR_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive(item.href)
                  ? "bg-fuchsia-600/10 text-fuchsia-400 font-medium"
                  : "text-purple-200/60 hover:text-purple-100 hover:bg-white/5"
              )}
            >
              <item.icon 
                size={20} 
                className={cn(
                  "transition-colors",
                  isActive(item.href) ? "text-fuchsia-400" : "text-purple-200/40 group-hover:text-purple-200"
                )} 
              />
              {item.title}
            </a>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          {isLoading ? (
            <div className="flex items-center gap-3 p-2 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
                <div className="h-2 w-24 bg-white/10 rounded animate-pulse" />
              </div>
            </div>
          ) : user ? (
            <Popover>
              <PopoverTrigger className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors group outline-none">
                <div className="w-10 h-10 rounded-full bg-linear-to-tr from-fuchsia-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-lg shadow-fuchsia-500/20">
                  {user.name?.slice(0, 2).toUpperCase() || "AD"}
                </div>
                <div className="flex-1 text-left overflow-hidden">
                  <p className="text-sm font-medium text-white group-hover:text-fuchsia-200 transition-colors truncate">{user.name || "Admin"}</p>
                  <p className="text-xs text-purple-200/50 truncate">{user.email}</p>
                </div>
                <ChevronUp size={16} className="text-purple-200/50 group-hover:text-purple-200 transition-colors" />
              </PopoverTrigger>
              <PopoverContent className="w-80 p-1 border-white/10 bg-zinc-950/90 backdrop-blur-2xl shadow-xl shadow-black/50" side="right" align="end" sideOffset={16}>
                <div className="flex items-center gap-3 p-3 border-b border-white/5 mb-1">
                  <div className="w-10 h-10 rounded-full bg-linear-to-tr from-fuchsia-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-lg shadow-fuchsia-500/20">
                    {user.name?.slice(0, 2).toUpperCase() || "AD"}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-semibold text-white truncate">{user.name || "Admin"}</p>
                    <p className="text-xs text-purple-200/50 truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-1 p-1">
                  <a 
                    href="/admin/profile" 
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-purple-100/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  >
                    <UsersRound size={16} className="text-purple-400" />
                    Profile & Account
                  </a>
                   <button 
                    disabled
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-purple-100/40 cursor-not-allowed"
                  >
                    <Tags size={16} />
                    Preferences
                  </button>
                  <div className="h-px bg-white/5 my-1" />
                  <a 
                    href="/api/auth/signout" 
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-400/80 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </a>
                </div>
              </PopoverContent>
            </Popover>
          ) : null}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen relative w-full">
        {/* Mobile Header */}
        <header className="lg:hidden p-4 border-b border-white/10 flex items-center gap-4 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-30">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-purple-200 hover:bg-white/5 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
          <span className="font-semibold text-white">Menu</span>
        </header>

        <main className="flex-1 w-full max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
