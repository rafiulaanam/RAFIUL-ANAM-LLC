import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Cta() {
  return (
    <section className="py-20 bg-primary text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Ready to Start Shopping?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust us for their shopping needs. Get started today and enjoy exclusive deals!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="text-primary hover:text-primary"
            >
              Start Shopping
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-white text-white hover:bg-white/10"
            >
              Learn More <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div>
              <div className="font-semibold mb-2">Free Shipping</div>
              <p className="text-white/80">On orders over $50</p>
            </div>
            <div>
              <div className="font-semibold mb-2">Secure Payment</div>
              <p className="text-white/80">100% secure checkout</p>
            </div>
            <div>
              <div className="font-semibold mb-2">24/7 Support</div>
              <p className="text-white/80">Here to help anytime</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 