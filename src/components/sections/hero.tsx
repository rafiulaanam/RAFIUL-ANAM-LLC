import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight">
              Your One-Stop Shop for Everything
              <span className="text-primary block sm:inline"> Premium</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0">
              Discover our curated collection of premium products. Quality meets convenience in every purchase.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" className="w-full sm:w-auto">
                Shop Now
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Learn More
              </Button>
            </div>
            <div className="flex items-center gap-4 sm:gap-8 justify-center lg:justify-start">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white bg-gray-200"
                  />
                ))}
              </div>
              <p className="text-sm sm:text-base text-muted-foreground">
                Trusted by <span className="font-semibold">10,000+</span> customers
              </p>
            </div>
          </div>
          <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] xl:h-[600px] mt-8 lg:mt-0">
            <Image
              src="/images/banner.png"
              alt="Featured Products"
              fill
              className="object-cover rounded-2xl"
              priority
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
} 