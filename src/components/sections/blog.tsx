"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight, Tag } from "lucide-react";

const articles = [
  {
    id: 1,
    title: "Top 10 Fashion Trends for the Season",
    excerpt: "Discover the latest fashion trends that are making waves in the industry this season.",
    image: "/blog/fashion-trends.jpg",
    category: "Fashion",
    date: "Mar 15, 2024",
    readTime: "5 min read",
    featured: true,
  },
  {
    id: 2,
    title: "Essential Tech Gadgets for Modern Living",
    excerpt: "Explore must-have tech gadgets that will revolutionize your daily life and boost productivity.",
    image: "/blog/tech-gadgets.jpg",
    category: "Technology",
    date: "Mar 12, 2024",
    readTime: "4 min read",
    featured: true,
  },
  {
    id: 3,
    title: "Sustainable Shopping: A Guide to Eco-Friendly Choices",
    excerpt: "Learn how to make environmentally conscious shopping decisions without compromising on quality.",
    image: "/blog/sustainable-shopping.jpg",
    category: "Lifestyle",
    date: "Mar 10, 2024",
    readTime: "6 min read",
    featured: false,
  },
  {
    id: 4,
    title: "Home Decor Ideas for Spring",
    excerpt: "Transform your living space with these fresh and inspiring home decoration ideas for spring.",
    image: "/blog/home-decor.jpg",
    category: "Home & Living",
    date: "Mar 8, 2024",
    readTime: "4 min read",
    featured: false,
  },
  {
    id: 5,
    title: "The Art of Gift Selection",
    excerpt: "Master the art of choosing the perfect gift for any occasion with our comprehensive guide.",
    image: "/blog/gift-guide.jpg",
    category: "Lifestyle",
    date: "Mar 5, 2024",
    readTime: "3 min read",
    featured: false,
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

export default function Blog() {
  const featuredArticles = articles.filter((article) => article.featured);
  const regularArticles = articles.filter((article) => !article.featured);

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
            Latest from Our Blog
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stay updated with the latest trends, tips, and insights from our expert team.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
        >
          {featuredArticles.map((article) => (
            <motion.article
              key={article.id}
              variants={itemVariants}
              className="group"
            >
              <Link href={`/blog/${article.id}`}>
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative h-64 sm:h-80">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <div className="flex items-center gap-4 mb-3 text-sm">
                        <span className="bg-primary/90 px-3 py-1 rounded-full">
                          {article.category}
                        </span>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {article.date}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {article.readTime}
                        </div>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold mb-2">
                        {article.title}
                      </h3>
                      <p className="text-white/90 line-clamp-2">
                        {article.excerpt}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {regularArticles.map((article) => (
            <motion.article
              key={article.id}
              variants={itemVariants}
              className="group"
            >
              <Link href={`/blog/${article.id}`}>
                <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative h-48">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        {article.category}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {article.readTime}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-muted-foreground line-clamp-2 mb-4">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center text-sm font-medium text-primary">
                      Read More
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </motion.div>

        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button size="lg" variant="outline" asChild>
            <Link href="/blog">
              View All Articles
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
} 