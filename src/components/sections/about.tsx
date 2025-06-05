"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

const highlights = [
  "10+ Years of Excellence",
  "100,000+ Happy Customers",
  "Premium Quality Products",
  "Fast & Reliable Service",
  "Secure Shopping Experience",
  "24/7 Customer Support",
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export default function About() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
              <Image
                src="/about/store-front.jpg"
                alt="Our Store"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="absolute -bottom-8 -right-8 w-2/3 aspect-video rounded-2xl overflow-hidden border-8 border-white shadow-xl">
              <Image
                src="/about/team.jpg"
                alt="Our Team"
                fill
                className="object-cover"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Your Trusted Shopping Destination Since 2014
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We&apos;re dedicated to providing you with the best shopping experience.
            </p>

            <motion.ul
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
            >
              {highlights.map((highlight, index) => (
                <motion.li
                  key={index}
                  variants={itemVariants}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span>{highlight}</span>
                </motion.li>
              ))}
            </motion.ul>

            <div className="flex flex-wrap gap-4">
              <Button size="lg">Learn More</Button>
              <Button size="lg" variant="outline">Contact Us</Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 