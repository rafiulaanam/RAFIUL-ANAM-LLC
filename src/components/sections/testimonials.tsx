import Image from "next/image";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Fashion Enthusiast",
    image: "/images/man.png",
    content:
      "I'm amazed by the quality of products and the exceptional customer service. The delivery was super fast, and everything arrived in perfect condition.",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Tech Professional",
    image: "/images/man.png",
    content:
      "The best online shopping experience I've had. The website is easy to navigate, and the product descriptions are detailed and accurate.",
    rating: 5,
  },
  {
    name: "Emma Davis",
    role: "Interior Designer",
    image: "/images/man.png",
    content:
      "Found exactly what I was looking for at a great price. The return process was smooth when I needed to exchange an item. Highly recommended!",
    rating: 4,
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-muted-foreground">
            Don't just take our word for it. Here's what our satisfied customers have to say.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="relative h-14 w-14">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    className="object-cover rounded-full"
                  />
                </div>
                <div>
                  <h3 className="font-semibold">{testimonial.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <p className="text-muted-foreground">{testimonial.content}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 