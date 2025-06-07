"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Verification failed");
        }

        setStatus("success");
        setMessage(data.message);
      } catch (error) {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Verification failed");
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-auto bg-card rounded-lg shadow-lg p-8"
      >
        {status === "loading" && (
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="flex flex-col items-center space-y-6"
          >
            <div className="relative w-16 h-16">
              <motion.div 
                className="absolute inset-0"
                animate={{ 
                  rotate: 360,
                  transition: { duration: 1, repeat: Infinity, ease: "linear" }
                }}
              >
                <div className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary" />
              </motion.div>
            </div>
            <p className="text-lg font-medium text-center">
              Verifying your email...
            </p>
            <p className="text-sm text-muted-foreground text-center">
              This will only take a moment
            </p>
          </motion.div>
        )}

        {status === "success" && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="flex flex-col items-center space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="rounded-full bg-green-100 p-3"
            >
              <Icons.check className="h-8 w-8 text-green-600" />
            </motion.div>
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-bold tracking-tight">
                Email Verified!
              </h1>
              <p className="text-muted-foreground">
                {message || "Your email has been successfully verified."}
              </p>
            </div>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/login">
                Continue to Login
              </Link>
            </Button>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="flex flex-col items-center space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="rounded-full bg-red-100 p-3"
            >
              <Icons.warning className="h-8 w-8 text-red-600" />
            </motion.div>
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-bold tracking-tight">
                Verification Failed
              </h1>
              <p className="text-muted-foreground">
                {message}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button variant="outline" asChild className="w-full sm:w-auto">
                <Link href="/register">
                  Back to Registration
                </Link>
              </Button>
              <Button asChild className="w-full sm:w-auto">
                <Link href="/verify-pending">
                  Try Again
                </Link>
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
} 