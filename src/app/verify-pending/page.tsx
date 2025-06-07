"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface VerificationStatus {
  isVerified: boolean;
  hasToken: boolean;
  isExpired: boolean;
  expiryTime?: number;
  message: string;
}

export default function VerifyPendingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    // Set email from URL parameter or session
    const emailFromUrl = searchParams.get("email");
    if (emailFromUrl) {
      setEmail(emailFromUrl);
    } else if (session?.user?.email) {
      setEmail(session.user.email);
    }
  }, [searchParams, session]);

  const handleResendVerification = async () => {
    if (!email) {
      toast.error("Email is required");
      return;
    }

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend verification email");
      }

      toast.success("Verification email sent! Please check your inbox.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to resend verification email";
      toast.error(message);
    }
  };

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Wait for session to be checked
        if (sessionStatus === "loading") return;

        // If no email available, don't check status
        if (!email) {
          setIsLoading(false);
          return;
        }

        const response = await fetch(`/api/auth/verification-status?email=${encodeURIComponent(email)}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to check verification status");
        }

        setVerificationStatus(data);

        if (data.isVerified) {
          toast.success("Email verified successfully!");
          router.push("/dashboard");
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to check verification status";
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
  }, [router, email, sessionStatus]);

  // Show loading state while checking session
  if (sessionStatus === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Checking verification status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6 bg-card rounded-lg shadow-lg">
        <Mail className="w-12 h-12 mx-auto mb-4 text-primary" />
        <h1 className="text-2xl font-bold mb-4">Check your email</h1>
        <p className="text-muted-foreground mb-6">
          {email ? (
            <>
              We&apos;ve sent you a verification link to {email}.<br />
          Please check your email and click the link to verify your account.
            </>
          ) : (
            <>
              Please check your email for the verification link.<br />
              Click the button below to resend the verification email.
            </>
          )}
        </p>
        {verificationStatus?.hasToken && !verificationStatus.isExpired && verificationStatus.expiryTime && (
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              Your verification link will expire in:
            </p>
            <p className="text-lg font-semibold">
              {new Date(verificationStatus.expiryTime).toLocaleTimeString()}
            </p>
          </div>
        )}
        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleResendVerification}
            disabled={!email}
          >
            Resend verification email
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.location.reload()}
          >
            Check verification status
          </Button>
          <Link href="/login">
            <Button variant="default" className="w-full">
              Back to Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
