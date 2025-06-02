"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, CreditCard, Truck, MapPin } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

interface ShippingInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  notes?: string;
}

const shippingMethods = [
  { id: "standard", name: "Standard Shipping", price: 5.99, days: "5-7" },
  { id: "express", name: "Express Shipping", price: 15.99, days: "2-3" },
];

const paymentMethods = [
  { id: "stripe", name: "Credit Card (Stripe)", icon: CreditCard },
  { id: "cod", name: "Cash on Delivery", icon: Truck },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { cart, loading: cartLoading } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shippingMethod, setShippingMethod] = useState(shippingMethods[0].id);
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0].id);
  
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: session?.user?.name || "",
    email: session?.user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    notes: "",
  });

  const selectedShippingMethod = shippingMethods.find(m => m.id === shippingMethod);
  const subtotal = cart?.total || 0;
  const shippingCost = selectedShippingMethod?.price || 0;
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + shippingCost + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);

      // Validate cart
      if (!cart?.items?.length) {
        toast.error("Your cart is empty");
        return;
      }

      // Validate shipping info
      const requiredFields: (keyof ShippingInfo)[] = [
        "fullName",
        "email",
        "phone",
        "address",
        "city",
        "state",
        "zipCode",
        "country",
      ];

      const missingFields = requiredFields.filter(field => !shippingInfo[field]);
      if (missingFields.length > 0) {
        toast.error(`Please fill in all required fields: ${missingFields.join(", ")}`);
        return;
      }

      // Create order
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.items,
          shippingInfo,
          shippingMethod,
          paymentMethod,
          subtotal,
          shippingCost,
          tax,
          total,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create order");
      }

      const data = await response.json();

      // Handle payment based on method
      if (paymentMethod === "stripe") {
        // Redirect to Stripe checkout
        router.push(data.checkoutUrl);
      } else {
        // For COD, just show success and redirect
        toast.success("Order placed successfully!");
        router.push(`/orders/${data.orderId}`);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to process your order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (cartLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading checkout...</p>
        </div>
      </div>
    );
  }

  // Redirect if cart is empty
  if (!cart?.items?.length) {
    router.push("/cart");
    return null;
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Shipping Information */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Shipping Information
            </h2>
            <div className="grid gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={shippingInfo.fullName}
                    onChange={e => setShippingInfo(prev => ({ ...prev, fullName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={shippingInfo.email}
                    onChange={e => setShippingInfo(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={shippingInfo.phone}
                  onChange={e => setShippingInfo(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={shippingInfo.address}
                  onChange={e => setShippingInfo(prev => ({ ...prev, address: e.target.value }))}
                  required
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={shippingInfo.city}
                    onChange={e => setShippingInfo(prev => ({ ...prev, city: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={shippingInfo.state}
                    onChange={e => setShippingInfo(prev => ({ ...prev, state: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={shippingInfo.zipCode}
                    onChange={e => setShippingInfo(prev => ({ ...prev, zipCode: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Select
                    value={shippingInfo.country}
                    onValueChange={value => setShippingInfo(prev => ({ ...prev, country: value }))}
                  >
                    <SelectTrigger id="country">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="GB">United Kingdom</SelectItem>
                      {/* Add more countries as needed */}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Order Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={shippingInfo.notes}
                  onChange={e => setShippingInfo(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any special instructions for delivery"
                />
              </div>
            </div>
          </div>

          {/* Shipping Method */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Shipping Method
            </h2>
            <RadioGroup
              value={shippingMethod}
              onValueChange={setShippingMethod}
              className="space-y-4"
            >
              {shippingMethods.map(method => (
                <div
                  key={method.id}
                  className={`flex items-center justify-between rounded-lg border p-4 cursor-pointer ${
                    shippingMethod === method.id ? "border-primary" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value={method.id} id={method.id} />
                    <div>
                      <Label htmlFor={method.id} className="font-medium">
                        {method.name}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {method.days} business days
                      </p>
                    </div>
                  </div>
                  <span className="font-medium">{formatPrice(method.price)}</span>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Payment Method */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Method
            </h2>
            <RadioGroup
              value={paymentMethod}
              onValueChange={setPaymentMethod}
              className="space-y-4"
            >
              {paymentMethods.map(method => (
                <div
                  key={method.id}
                  className={`flex items-center justify-between rounded-lg border p-4 cursor-pointer ${
                    paymentMethod === method.id ? "border-primary" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value={method.id} id={method.id} />
                    <div className="flex items-center gap-2">
                      <method.icon className="h-5 w-5" />
                      <Label htmlFor={method.id} className="font-medium">
                        {method.name}
                      </Label>
                    </div>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-4">
              {/* Cart Items */}
              <div className="space-y-3">
                {cart.items.map(item => (
                  <div key={item.productId} className="flex items-start gap-4">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity} × {formatPrice(item.price)}
                      </p>
                    </div>
                    <p className="font-medium">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-base">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-base">
                  <span>Shipping</span>
                  <span>{formatPrice(shippingCost)}</span>
                </div>
                <div className="flex justify-between text-base">
                  <span>Tax</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay ${formatPrice(total)}`
                )}
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                By placing your order, you agree to our{" "}
                <a href="/terms" className="underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" className="underline">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
} 