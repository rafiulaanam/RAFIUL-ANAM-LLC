import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, ArrowRight } from "lucide-react";

const posts = [
  {
    title: "Top 10 Fashion Trends for 2024",
    excerpt:
      "Discover the latest fashion trends that will dominate the industry this year. From sustainable fashion to retro comebacks.",
    image: "/images/blog.png",
    date: "Jan 15, 2024",
    readTime: "5 min read",
    category: "Fashion",
    slug: "top-10-fashion-trends-2024",
  },
  {
    title: "The Future of Smart Home Technology",
    excerpt:
      "Explore how smart home devices are revolutionizing our daily lives and what to expect in the coming years.",
    image: "/images/blog.png",
    date: "Jan 12, 2024",
    readTime: "4 min read",
    category: "Technology",
    slug: "future-of-smart-home-technology",
  },
  {
    title: "Essential Kitchen Gadgets for 2024",
    excerpt:
      "Must-have kitchen tools and appliances that will make your cooking experience more enjoyable and efficient.",
    image: "/images/blog.png",
    date: "Jan 10, 2024",
    readTime: "6 min read",
    category: "Home & Living",
    slug: "essential-kitchen-gadgets-2024",
  },
];

export default function Blog() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Latest from Our Blog
          </h2>
          <p className="text-lg text-muted-foreground">
            Stay updated with the latest trends, tips, and insights from our experts.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden group"
            >
              <Link href={`/blog/${post.slug}`}>
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded">
                      {post.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <CalendarDays className="h-4 w-4" />
                      {post.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {post.readTime}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                  <div className="flex items-center text-primary font-medium">
                    Read More <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            View All Posts
          </Button>
        </div>
      </div>
    </section>
  );
} 