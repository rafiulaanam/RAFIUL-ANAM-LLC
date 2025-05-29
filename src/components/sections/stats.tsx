import { Users, ShoppingBag, Globe, Star } from "lucide-react";

const stats = [
  {
    name: "Active Users",
    value: "1M+",
    description: "Satisfied customers worldwide",
    icon: Users,
  },
  {
    name: "Products Sold",
    value: "500K+",
    description: "Items delivered successfully",
    icon: ShoppingBag,
  },
  {
    name: "Countries",
    value: "50+",
    description: "Global presence",
    icon: Globe,
  },
  {
    name: "Reviews",
    value: "4.8",
    description: "Average customer rating",
    icon: Star,
  },
];

export default function Stats() {
  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Our Growth in Numbers
          </h2>
          <p className="text-lg text-muted-foreground">
            We're proud of our achievements and the trust our customers place in us.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 text-center"
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-6">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="text-3xl font-bold mb-2">{stat.value}</div>
              <div className="font-semibold mb-1">{stat.name}</div>
              <div className="text-sm text-muted-foreground">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 bg-primary/5 rounded-2xl p-8">
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold mb-2">Trusted by Businesses</h3>
            <p className="text-muted-foreground">
              Join thousands of businesses that trust us with their e-commerce needs.
            </p>
          </div>
          <div className="md:col-span-2 flex items-center justify-center md:justify-end">
            <div className="flex space-x-8">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-20 h-10 bg-gray-200 dark:bg-gray-700 rounded"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 