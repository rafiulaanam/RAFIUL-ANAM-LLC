"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingBag, Star, TrendingUp } from "lucide-react";

interface HeroProduct {
  _id: string;
  name: string;
  price: number;
  images: string[];
  rating: number;
  discount?: number;
}

export default function Hero() {
  const [featuredProducts, setFeaturedProducts] = useState<HeroProduct[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch("/api/products/featured");
        const data = await response.json();
        if (data.products) {
          setFeaturedProducts(data.products.slice(0, 3));
        }
      } catch (error) {
        console.error("Error fetching featured products:", error);
      }
    };

    fetchFeaturedProducts();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => 
        prev === (featuredProducts.length - 1) ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(timer);
  }, [featuredProducts.length]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1 
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <section className="relative bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20 pb-12 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-grid-gray-900/[0.04] dark:bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-gray-800" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left Column - Content */}
          <motion.div className="space-y-8" variants={itemVariants}>
            <div className="space-y-4">
              <motion.div 
                className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <TrendingUp size={16} />
                <span className="text-sm font-medium">New Collection 2024</span>
              </motion.div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight">
                Discover Our
                <span className="text-primary block mt-2">Premium Selection</span>
            </h1>
              
              <p className="text-lg sm:text-xl text-muted-foreground max-w-lg">
                Explore our curated collection of premium products. Quality meets style in every piece.
            </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="group" asChild>
                <Link href="/shop">
                Shop Now
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/categories">
                  Browse Categories
                </Link>
              </Button>
            </div>

            <div className="flex items-center gap-8">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 overflow-hidden"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i }}
                  >
                    <Image
                      src={`/images/avatar-${i}.png`}
                      alt={`Customer ${i}`}
                      width={40}
                      height={40}
                    />
                  </motion.div>
                ))}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="w-4 h-4 fill-primary text-primary"
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Trusted by <span className="font-semibold">10,000+</span> customers
              </p>
            </div>
          </div>
          </motion.div>

          {/* Right Column - Featured Products */}
          <motion.div 
            className="relative h-[500px] lg:h-[600px]"
            variants={itemVariants}
          >
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product._id}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                }`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: index === currentSlide ? 1 : 0.8,
                  opacity: index === currentSlide ? 1 : 0,
                }}
                transition={{ duration: 0.5 }}
              >
                <div className="relative h-full w-full">
            <Image
                    src={product.images[0]}
                    alt={product.name}
              fill
              className="object-cover rounded-2xl"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                    priority={index === 0}
            />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">
                          ${product.price.toFixed(2)}
                        </span>
                        {product.discount && product.discount > 0 && (
                          <Badge variant="destructive" className="text-sm">
                            {product.discount}% OFF
                          </Badge>
                        )}
                      </div>
                      <Button size="sm" variant="secondary" className="gap-2">
                        <ShoppingBag className="w-4 h-4" />
                        Shop Now
                      </Button>
                    </div>
          </div>
        </div>
              </motion.div>
            ))}

            {/* Slide indicators */}
            <div className="absolute bottom-4 right-4 flex gap-2">
              {featuredProducts.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentSlide 
                      ? "bg-primary w-6" 
                      : "bg-white/50 hover:bg-white/75"
                  }`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
} 