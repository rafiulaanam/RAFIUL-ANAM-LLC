import { Search, ShoppingCart, Truck } from "lucide-react";

const steps = [
  {
    title: "Browse Products",
    description:
      "Explore our wide range of products across various categories. Use filters to find exactly what you're looking for.",
    icon: Search,
  },
  {
    title: "Add to Cart",
    description:
      "Select your desired items and add them to your cart. Review your selections and proceed to checkout.",
    icon: ShoppingCart,
  },
  {
    title: "Fast Delivery",
    description:
      "Receive your order at your doorstep with our fast and reliable shipping service. Track your order in real-time.",
    icon: Truck,
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground">
            Shopping with us is easy and convenient. Here's how you can get started.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative flex flex-col items-center text-center"
            >
              <div className="mb-8">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-lg font-semibold">
                    {index + 1}
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-24 left-[60%] w-[40%] h-0.5 bg-gray-200 dark:bg-gray-700" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 