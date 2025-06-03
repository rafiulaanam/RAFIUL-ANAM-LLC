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
    <section className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-3 sm:mb-4">
            Why Choose Us?
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground px-4">
            We provide the best shopping experience with features designed for your convenience.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {features.map((feature) => (
            <div
              key={feature.name}
              className="flex flex-col items-center text-center p-4 sm:p-6 rounded-lg bg-gray-50 dark:bg-gray-800 transition-transform hover:scale-105"
            >
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 sm:mb-4">
                <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">{feature.name}</h3>
              <p className="text-sm sm:text-base text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 