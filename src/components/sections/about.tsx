import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const values = [
  "Customer satisfaction is our top priority",
  "Quality products at competitive prices",
  "Fast and reliable shipping worldwide",
  "24/7 customer support",
];

export default function About() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative h-[500px] rounded-2xl overflow-hidden">
            <Image
              src="/images/image.png"
              alt="About Our Company"
              fill
              className="object-cover"
            />
          </div>
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                About Our Company
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                We started with a simple mission: to provide high-quality products
                at affordable prices while delivering exceptional customer service.
              </p>
              <p className="text-lg text-muted-foreground">
                Today, we're proud to serve millions of customers worldwide,
                offering a curated selection of premium products across various
                categories.
              </p>
            </div>
            <ul className="space-y-4">
              {values.map((value, index) => (
                <li key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-primary" />
                  <span>{value}</span>
                </li>
              ))}
            </ul>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg">
                <div className="text-3xl font-bold text-primary mb-2">1M+</div>
                <div className="text-sm text-muted-foreground">Happy Customers</div>
              </div>
              <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg">
                <div className="text-3xl font-bold text-primary mb-2">50+</div>
                <div className="text-sm text-muted-foreground">Countries Served</div>
              </div>
            </div>
            <Button size="lg">Learn More About Us</Button>
          </div>
        </div>
      </div>
    </section>
  );
} 