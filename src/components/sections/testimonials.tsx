"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    content: "The quality of products and customer service is exceptional. I've been a loyal customer for years and have never been disappointed.",
    author: "Sarah Johnson",
    role: "Fashion Enthusiast",
    image: "/testimonials/sarah.jpg",
  },
  {
    id: 2,
    content: "Fast shipping, great prices, and an amazing selection of products. This is my go-to online shopping destination.",
    author: "Michael Chen",
    role: "Tech Professional",
    image: "/testimonials/michael.jpg",
  },
  {
    id: 3,
    content: "The attention to detail and the user experience is outstanding. Shopping here is always a pleasure.",
    author: "Emma Davis",
    role: "Interior Designer",
    image: "/testimonials/emma.jpg",
  },
];

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

export default function Testimonials() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our valued customers have to say about their shopping experience.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              variants={itemVariants}
              className="group"
            >
              <div className="bg-gray-50 rounded-2xl p-8 relative">
                <Quote className="w-10 h-10 text-primary/20 absolute -top-2 -left-2" />
                <div className="relative">
                  <p className="text-lg mb-6 text-muted-foreground">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden">
                      <Image
                        src={testimonial.image}
                        alt={testimonial.author}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold">
                        {testimonial.author}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 border-2 border-primary/10 rounded-2xl -z-10 transform rotate-3 group-hover:rotate-0 transition-transform duration-300" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
} 