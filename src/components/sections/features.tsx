"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Shield, Truck, Headphones } from "lucide-react";

const features = [
  {
    icon: ShoppingBag,
    title: "Easy Shopping",
    description: "Browse through our extensive collection of products with our intuitive interface.",
    color: "bg-blue-500",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Your transactions are protected with state-of-the-art security measures.",
    color: "bg-green-500",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Get your orders delivered to your doorstep quickly and efficiently.",
    color: "bg-purple-500",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Our customer service team is always ready to help you with any queries.",
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

export default function Features() {
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
            Why Choose Us?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We provide the best shopping experience with features that make your journey seamless and enjoyable.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="relative group"
            >
              <div className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
} 