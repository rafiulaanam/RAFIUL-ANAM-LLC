export default function AboutPage() {
  return (
    <div className="min-h-screen py-12 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">About Us</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
              <p className="text-muted-foreground">
                Founded in 2024, MyStore has been dedicated to providing high-quality products
                to our customers. We believe in creating an exceptional shopping experience
                through carefully curated products and outstanding customer service.
              </p>
            </div>
            
            <div>
              <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
              <p className="text-muted-foreground">
                We strive to make quality products accessible to everyone while maintaining
                the highest standards of customer satisfaction. Our goal is to build lasting
                relationships with our customers through trust and reliability.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Why Choose Us</h2>
              <ul className="space-y-4 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 bg-primary rounded-full" />
                  Quality Guaranteed Products
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 bg-primary rounded-full" />
                  Fast & Reliable Shipping
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 bg-primary rounded-full" />
                  24/7 Customer Support
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 bg-primary rounded-full" />
                  Secure Payment Methods
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">Our Values</h2>
              <p className="text-muted-foreground">
                We are committed to sustainability, ethical business practices, and
                creating a positive impact in our community. Every purchase you make
                helps us continue our mission of providing exceptional products while
                maintaining these core values.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 