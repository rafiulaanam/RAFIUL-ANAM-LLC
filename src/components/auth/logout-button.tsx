"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { handleLogout } from "@/lib/auth-utils";
import { toast } from "sonner";

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function LogoutButton({ variant = "default" }: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogoutClick = async () => {
    try {
      setIsLoading(true);
      await handleLogout();
      router.refresh(); // Force refresh to update server components
    } catch (error) {
      toast.error("Failed to logout. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      onClick={handleLogoutClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Icons.logout className="mr-2 h-4 w-4" />
      )}
      Logout
    </Button>
  );
} 