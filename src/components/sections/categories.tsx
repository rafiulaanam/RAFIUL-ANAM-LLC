import Image from "next/image";
import Link from "next/link";

const categories = [
  {
    name: "Electronics",
    description: "Latest gadgets and tech accessories",
    image: "/images/product.png",
    itemCount: 120,
    href: "/categories/electronics",
  },
  {
    name: "Fashion",
    description: "Trendy clothing and accessories",
    image: "/images/product.png",
    itemCount: 350,
    href: "/categories/fashion",
  },
  {
    name: "Home & Living",
    description: "Furniture and home decor",
    image: "/images/product.png",
    itemCount: 240,
    href: "/categories/home-living",
  },
  {
    name: "Beauty",
    description: "Cosmetics and personal care",
    image: "/images/product.png",
    itemCount: 180,
    href: "/categories/beauty",
  },
  {
    name: "Sports",
    description: "Athletic gear and equipment",
    image: "/images/product.png",
    itemCount: 150,
    href: "/categories/sports",
  },
  {
    name: "Books",
    description: "Books and stationery",
    image: "/images/product.png",
    itemCount: 200,
    href: "/categories/books",
  },
];

export default function Categories() {
  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Shop by Category
          </h2>
          <p className="text-lg text-muted-foreground">
            Browse through our wide range of categories and find exactly what you need.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="group relative overflow-hidden rounded-2xl"
            >
              <div className="relative h-80">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/0" />
                <div className="absolute bottom-0 p-6 text-white">
                  <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                  <p className="text-sm text-gray-200 mb-2">
                    {category.description}
                  </p>
                  <span className="text-sm font-medium">
                    {category.itemCount} items
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
} 