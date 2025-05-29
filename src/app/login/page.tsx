"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/ui/icons";
import { handleLogin } from "@/lib/auth-utils";

// Helper function to clean callback URL
function cleanCallbackUrl(url: string | null): string {
  if (!url) return '/';
  
  try {
    const parsed = new URL(decodeURIComponent(url));
    // Only allow callbacks to our own domain
    if (parsed.hostname !== 'localhost' && parsed.hostname !== window.location.hostname) {
      return '/';
    }
    // Prevent infinite loops by checking for repeated login paths
    if (parsed.pathname.includes('/login') || parsed.pathname.includes('/signin')) {
      return '/';
    }
    return parsed.pathname + parsed.search;
  } catch {
    return '/';
  }
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status, update } = useSession();
  const [isLoading, setIsLoading] = useState<{[key: string]: boolean}>({
    credentials: false,
    google: false,
    github: false,
  });
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    // Check for success message from registration
    const message = searchParams?.get("message");
    if (message) {
      toast.success(message);
    }

    // Check for error message
    const error = searchParams?.get("error");
    if (error) {
      toast.error(decodeURIComponent(error));
    }

    // Handle session state
    if (status === "authenticated" && session?.user) {
      const callbackUrl = cleanCallbackUrl(searchParams?.get("callbackUrl"));
      router.push(callbackUrl);
      router.refresh();
    }
  }, [session, status, router, searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading((prev) => ({ ...prev, credentials: true }));

    try {
      const callbackUrl = cleanCallbackUrl(searchParams?.get("callbackUrl"));
      const result = await handleLogin({
        email: formData.email.toLowerCase(),
        password: formData.password,
      }, callbackUrl);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      // Force session update
      await update();
      
      if (result?.ok) {
        toast.success("Welcome back!");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading((prev) => ({ ...prev, credentials: false }));
    }
  }

  const handleSocialLogin = async (provider: "google" | "github") => {
    try {
      setIsLoading((prev) => ({ ...prev, [provider]: true }));
      const callbackUrl = cleanCallbackUrl(searchParams?.get("callbackUrl"));
      await handleLogin({ provider }, callbackUrl);
    } catch (error) {
      toast.error("Something went wrong with social login. Please try again.");
      setIsLoading((prev) => ({ ...prev, [provider]: false }));
    }
  };

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to your account
          </p>
        </div>

        <div className="grid gap-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Button
                variant="outline"
                disabled={isLoading.google}
                onClick={() => handleSocialLogin("google")}
              >
                {isLoading.google ? (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Icons.google className="mr-2 h-4 w-4" />
                )}
                Continue with Google
              </Button>
              <Button
                variant="outline"
                disabled={isLoading.github}
                onClick={() => handleSocialLogin("github")}
              >
                {isLoading.github ? (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Icons.gitHub className="mr-2 h-4 w-4" />
                )}
                Continue with GitHub
              </Button>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <form onSubmit={onSubmit}>
              <div className="grid gap-2">
                <div className="grid gap-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    placeholder="name@example.com"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={isLoading.credentials}
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    placeholder="Enter your password"
                    type="password"
                    autoComplete="current-password"
                    disabled={isLoading.credentials}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <Button disabled={isLoading.credentials}>
                  {isLoading.credentials && (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Sign In
                </Button>
              </div>
            </form>
          </div>
          <div className="text-center text-sm">
            Don't have an account?{" "}
            <Link href="/register" className="underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 