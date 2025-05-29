import Image from "next/image";

const brands = [
  {
    name: "Apple",
    logo: "/images/brand.png",
  },
  {
    name: "Samsung",
    logo: "/images/brand.png",
  },
  {
    name: "Sony",
    logo: "/images/brand.png",
  },
  {
    name: "LG",
    logo: "/images/brand.png",
  },
  {
    name: "Nike",
    logo: "/images/brand.png",
  },
  {
    name: "Adidas",
    logo: "/images/brand.png",
  },
  {
    name: "Puma",
    logo: "/images/brand.png",
  },
  {
    name: "Reebok",
    logo: "/images/brand.png",
  },
];

export default function Brands() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Trusted by Leading Brands
          </h2>
          <p className="text-lg text-muted-foreground">
            We partner with the world's top brands to bring you quality products.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
          {brands.map((brand) => (
            <div
              key={brand.name}
              className="flex items-center justify-center p-8 bg-white dark:bg-gray-900 rounded-xl hover:shadow-md transition-shadow"
            >
              <div className="relative h-12 w-32">
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  fill
                  className="object-contain filter dark:invert"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 