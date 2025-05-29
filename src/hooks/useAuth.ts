import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useAuth(options: {
  required?: boolean;
  requiredRole?: "ADMIN" | "VENDOR" | "USER";
  redirectTo?: string;
} = {}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (options.required && status === "unauthenticated") {
      const redirectUrl = options.redirectTo || "/login";
      router.push(redirectUrl);
      return;
    }

    if (
      options.requiredRole &&
      session?.user?.role !== options.requiredRole &&
      status !== "loading"
    ) {
      router.push("/");
      return;
    }
  }, [session, status, router, options]);

  return {
    session,
    status,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    user: session?.user,
    role: session?.user?.role,
  };
} 