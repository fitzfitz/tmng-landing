import { useState, useEffect } from "react";
import { APP_CONSTANTS } from "@/config/constants";

export function useUser() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for token in localStorage
    const savedToken = localStorage.getItem(
      APP_CONSTANTS.STORAGE_KEYS.AUTH_TOKEN,
    );
    setToken(savedToken);

    // Try to get user from storage
    const savedUser = localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.USER);
    if (savedUser) {
      try {
        setUserData(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }

    setIsLoading(false);
  }, []);

  return {
    isLoggedIn: !!token,
    isLoading,
    token,
    user: user || (token ? { name: "Admin", email: "admin@tmng.my.id" } : null),
  };
}
