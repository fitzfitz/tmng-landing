import { useEffect, useState } from "react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  // Optional: Add loading state
  
  useEffect(() => {
    const API_URL = import.meta.env.PUBLIC_API_URL;
    fetch(`${API_URL}/api/auth/me`)
      .then(res => res.json())
      .then(data => {
        if (!data.user) {
          window.location.href = "/admin/login";
        } else {
          setAuthorized(true);
        }
      })
      .catch(() => {
          window.location.href = "/admin/login";
      });
  }, []);

  if (!authorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Verifying access...</div>
      </div>
    );
  }

  return <>{children}</>;
}
