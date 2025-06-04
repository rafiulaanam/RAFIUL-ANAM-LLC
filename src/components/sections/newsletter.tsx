"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowRight, Gift } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const benefits = [
  {
    icon: Gift,
    text: "Exclusive discounts and offers",
  },
  {
    icon: Mail,
    text: "New product announcements",
  },
  {
    icon: ArrowRight,
    text: "Early access to sales",
  },
];

export default function Newsletter() {
  return (
    <section className="py-24 bg-primary/5">
      <div className="container mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Stay in the Loop
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Subscribe to our newsletter and be the first to know about new products,
              exclusive offers, and shopping tips.
            </p>
          </motion.div>

          <motion.form
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 mb-8"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="flex-1">
              <Input
                type="email"
                placeholder="Enter your email"
                className="w-full h-12"
              />
            </div>
            <Button size="lg" className="w-full sm:w-auto">
              Subscribe
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.form>

          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6"
          >
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
              >
                <benefit.icon className="w-4 h-4 text-primary" />
                <span>{benefit.text}</span>
              </div>
            ))}
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="text-xs text-muted-foreground mt-6"
          >
            By subscribing, you agree to our Privacy Policy and consent to receive updates
            from our company.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
} 