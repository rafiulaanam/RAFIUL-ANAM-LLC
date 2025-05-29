"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription logic
    console.log("Subscribing email:", email);
    setEmail("");
  };

  return (
    <section className="py-20 bg-primary text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 mb-6">
            <Mail className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Stay Updated with Our Newsletter
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter and get exclusive deals, new product announcements, and shopping tips delivered to your inbox.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
            <Button
              type="submit"
              variant="secondary"
              size="lg"
              className="whitespace-nowrap"
            >
              Subscribe Now
            </Button>
          </form>
          <p className="text-sm text-white/60 mt-4">
            By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
          </p>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">Daily Updates</div>
              <p className="text-white/80">Get the latest product updates and offers</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">Exclusive Offers</div>
              <p className="text-white/80">Subscriber-only discounts and deals</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">No Spam</div>
              <p className="text-white/80">We respect your inbox and privacy</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 