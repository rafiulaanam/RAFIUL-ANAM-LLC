"use client";

import { motion } from "framer-motion";
import { Users, ShoppingBag, Globe2, Star } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "100K+",
    label: "Happy Customers",
    description: "Satisfied customers worldwide",
    color: "text-blue-500",
  },
  {
    icon: ShoppingBag,
    value: "50K+",
    label: "Products",
    description: "Unique products available",
    color: "text-green-500",
  },
  {
    icon: Globe2,
    value: "120+",
    label: "Countries",
    description: "Global shipping coverage",
    color: "text-purple-500",
  },
  {
    icon: Star,
    value: "4.9",
    label: "Rating",
    description: "Average customer rating",
    color: "text-yellow-500",
  },
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
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const numberVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export default function Stats() {
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
            Our Growth in Numbers
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We're proud of our achievements and the trust our customers place in us.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="relative group"
            >
              <div className="bg-white rounded-xl p-6 text-center relative z-10">
                <div className={`inline-flex p-3 rounded-lg ${stat.color} bg-opacity-10 mb-4`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <motion.div
                  variants={numberVariants}
                  className="text-4xl font-bold mb-2"
                >
                  {stat.value}
                </motion.div>
                <h3 className="text-lg font-semibold mb-2">
                  {stat.label}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {stat.description}
                </p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-xl transform group-hover:scale-105 transition-transform duration-300" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
} 