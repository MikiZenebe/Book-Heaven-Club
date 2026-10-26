import { useEffect } from "react";

import { useAuthStore } from "@/stores/authStore";

export default function AuthInitializer() {
  const loadCurrentUser = useAuthStore((state) => state.loadCurrentUser);

  useEffect(() => {
    void loadCurrentUser();
  }, [loadCurrentUser]);

  return null;
}
