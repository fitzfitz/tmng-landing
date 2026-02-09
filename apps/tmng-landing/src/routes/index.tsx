import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { RootLayout } from "@/components/layout/root-layout";
import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { AdminLayout } from "@/components/layout/admin-layout";

// Lazy load pages
const HomePage = lazy(() => import("@/pages/home/page"));
const BlogListPage = lazy(() => import("@/pages/blog/page"));
const BlogDetailPage = lazy(() => import("@/pages/blog/[slug]/page"));
const WorkListPage = lazy(() => import("@/pages/work/page"));
const WorkDetailPage = lazy(() => import("@/pages/work/[slug]/page"));
const ContactPage = lazy(() => import("@/pages/contact/page"));
const PrivacyPage = lazy(() => import("@/pages/privacy/page"));
const TermsPage = lazy(() => import("@/pages/terms/page"));

// Admin pages
const AdminLoginPage = lazy(() => import("@/pages/admin/login/page"));
const AdminDashboardPage = lazy(() => import("@/pages/admin/dashboard/page"));
const AdminPostsPage = lazy(() => import("@/pages/admin/posts/page"));
const AdminPostNewPage = lazy(() => import("@/pages/admin/posts/new/page"));
const AdminPostEditPage = lazy(
  () => import("@/pages/admin/posts/[id]/edit/page"),
);
const AdminUsersPage = lazy(() => import("@/pages/admin/users/page"));
const AdminContactsPage = lazy(() => import("@/pages/admin/contacts/page"));
const AdminSubscribersPage = lazy(
  () => import("@/pages/admin/subscribers/page"),
);
const AdminTagsPage = lazy(() => import("@/pages/admin/tags/page"));
const AdminCategoriesPage = lazy(() => import("@/pages/admin/categories/page"));
const AdminPortfolioPage = lazy(() => import("@/pages/admin/portfolio/page"));

// Loading component
const PageLoader = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="text-lg">Loading...</div>
  </div>
);

// Wrapped component for lazy loading
const Lazy = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: (
          <Lazy>
            <HomePage />
          </Lazy>
        ),
      },
      {
        path: "blog",
        element: (
          <Lazy>
            <BlogListPage />
          </Lazy>
        ),
      },
      {
        path: "blog/:slug",
        element: (
          <Lazy>
            <BlogDetailPage />
          </Lazy>
        ),
      },
      {
        path: "work",
        element: (
          <Lazy>
            <WorkListPage />
          </Lazy>
        ),
      },
      {
        path: "work/:slug",
        element: (
          <Lazy>
            <WorkDetailPage />
          </Lazy>
        ),
      },
      {
        path: "contact",
        element: (
          <Lazy>
            <ContactPage />
          </Lazy>
        ),
      },
      {
        path: "privacy",
        element: (
          <Lazy>
            <PrivacyPage />
          </Lazy>
        ),
      },
      {
        path: "terms",
        element: (
          <Lazy>
            <TermsPage />
          </Lazy>
        ),
      },
    ],
  },
  {
    path: "/admin/login",
    element: (
      <Lazy>
        <AdminLoginPage />
      </Lazy>
    ),
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <Lazy>
            <AdminDashboardPage />
          </Lazy>
        ),
      },
      {
        path: "posts",
        element: (
          <Lazy>
            <AdminPostsPage />
          </Lazy>
        ),
      },
      {
        path: "posts/new",
        element: (
          <Lazy>
            <AdminPostNewPage />
          </Lazy>
        ),
      },
      {
        path: "posts/:id/edit",
        element: (
          <Lazy>
            <AdminPostEditPage />
          </Lazy>
        ),
      },
      {
        path: "users",
        element: (
          <Lazy>
            <AdminUsersPage />
          </Lazy>
        ),
      },
      {
        path: "contacts",
        element: (
          <Lazy>
            <AdminContactsPage />
          </Lazy>
        ),
      },
      {
        path: "subscribers",
        element: (
          <Lazy>
            <AdminSubscribersPage />
          </Lazy>
        ),
      },
      {
        path: "tags",
        element: (
          <Lazy>
            <AdminTagsPage />
          </Lazy>
        ),
      },
      {
        path: "categories",
        element: (
          <Lazy>
            <AdminCategoriesPage />
          </Lazy>
        ),
      },
      {
        path: "portfolio",
        element: (
          <Lazy>
            <AdminPortfolioPage />
          </Lazy>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
