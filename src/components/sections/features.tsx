import { ShieldCheck, Truck, CreditCard, Package } from "lucide-react";

const features = [
  {
    name: "Secure Payments",
    description: "Your transactions are protected with industry-leading security protocols",
    icon: ShieldCheck,
  },
  {
    name: "Fast Delivery",
    description: "Get your orders delivered within 24-48 hours nationwide",
    icon: Truck,
  },
  {
    name: "Easy Returns",
    description: "Hassle-free returns within 30 days of purchase",
    icon: Package,
  },
  {
    name: "Multiple Payment Options",
    description: "Choose from various payment methods for your convenience",
    icon: CreditCard,
  },
];

export default function Features() {
  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Why Choose Us?
          </h2>
          <p className="text-lg text-muted-foreground">
            We provide the best shopping experience with features designed for your convenience.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div
              key={feature.name}
              className="flex flex-col items-center text-center p-6 rounded-lg bg-gray-50 dark:bg-gray-800"
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.name}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 