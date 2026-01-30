import "@/styles/global.css";
import { useState, type ReactNode } from "react";
import { handleSignOut } from "@/lib/auth-client";

type User = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: "pending" | "author" | "admin";
};

type AdminLayoutProps = {
  user: User;
  children: ReactNode;
  currentPath?: string;
};

const navItems = [
  { label: "Dashboard", href: "/admin", icon: "dashboard" },
  { label: "Posts", href: "/admin/posts", icon: "posts" },
  { label: "Categories", href: "/admin/categories", icon: "categories" },
  { label: "Tags", href: "/admin/tags", icon: "tags" },
  { label: "Subscribers", href: "/admin/subscribers", icon: "subscribers" },
  { label: "Contacts", href: "/admin/contacts", icon: "contacts" },
];

const adminOnlyItems = [
  { label: "Users", href: "/admin/users", icon: "users" },
];

const icons: Record<string, React.FC<{ className?: string }>> = {
  dashboard: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  posts: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
  ),
  categories: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  ),
  tags: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  ),
  subscribers: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  contacts: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  users: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
};

export default function AdminLayout({ user, children, currentPath: propCurrentPath }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const allNavItems = user.role === "admin" ? [...navItems, ...adminOnlyItems] : navItems;
  const currentPath = propCurrentPath || (typeof window !== "undefined" ? window.location.pathname : "/admin");

  return (
    <div className="min-h-screen flex admin-layout">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-bg-dark border-r border-purple-900/20
        transform transition-transform duration-300 lg:translate-x-0 lg:static
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-purple-900/20">
          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center">
            <span className="text-lg font-bold text-white">TM</span>
          </div>
          <div>
            <div className="font-bold text-white">TMNG</div>
            <div className="text-xs text-gray-400">Admin Panel</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-6 space-y-2">
          {allNavItems.map((item) => {
            const Icon = icons[item.icon];
            const isActive = currentPath === item.href || 
              (item.href !== "/admin" && currentPath.startsWith(item.href));
            
            return (
              <a
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                  ${isActive 
                    ? "bg-purple-600 text-white" 
                    : "text-gray-400 hover:bg-purple-900/20 hover:text-white"
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Role Badge */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="px-4 py-2 rounded-xl bg-purple-900/20 text-center">
            <span className={`
              text-xs font-medium px-2 py-1 rounded-full
              ${user.role === "admin" 
                ? "bg-purple-600 text-white" 
                : "bg-gray-700 text-gray-300"
              }
            `}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-bg-dark-alt border-b border-purple-900/20">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-white hover:bg-purple-900/20 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Spacer */}
            <div className="flex-1" />

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 p-2 hover:bg-purple-900/20 rounded-xl transition-colors"
              >
                {user.image ? (
                  <img src={user.image} alt={user.name} className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-medium text-sm">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
                <span className="text-white font-medium hidden sm:block">{user.name}</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-bg-dark border border-purple-900/20 rounded-xl shadow-xl py-2">
                  <div className="px-4 py-2 border-b border-purple-900/20">
                    <div className="text-white font-medium">{user.name}</div>
                    <div className="text-gray-400 text-sm truncate">{user.email}</div>
                  </div>
                  <a href="/blog" className="block px-4 py-2 text-gray-400 hover:bg-purple-900/20 hover:text-white">
                    View Blog
                  </a>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/10"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
