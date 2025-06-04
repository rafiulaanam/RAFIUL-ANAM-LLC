"use client";

import { motion } from "framer-motion";
import { Search, ShoppingCart, Truck, Heart } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Browse Products",
    description: "Explore our vast collection of premium products across various categories.",
    color: "bg-blue-500",
  },
  {
    icon: ShoppingCart,
    title: "Add to Cart",
    description: "Select your favorite items and add them to your shopping cart.",
    color: "bg-green-500",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Get your orders delivered right to your doorstep with our express shipping.",
    color: "bg-purple-500",
  },
  {
    icon: Heart,
    title: "Enjoy Shopping",
    description: "Experience the joy of quality products and excellent service.",
    color: "bg-pink-500",
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

export default function HowItWorks() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Shopping with us is easy and convenient. Just follow these simple steps to get started.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="relative"
            >
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="relative">
                  <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mb-6 mx-auto transform -rotate-6 group-hover:rotate-0 transition-transform duration-300`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 bg-black/5 rounded-2xl rotate-6 -z-10" />
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center">
                    <span className="w-8 h-8 rounded-full bg-gray-100 text-primary font-semibold text-lg flex items-center justify-center mb-4">
                      {index + 1}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 right-0 w-full h-0.5 bg-gray-200 -z-10 transform translate-x-1/2">
                  <div className="absolute top-1/2 right-0 w-2 h-2 rounded-full bg-primary transform -translate-y-1/2" />
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
} 