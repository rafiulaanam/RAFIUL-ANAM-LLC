import Link from "next/link";
import { Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const footerLinks = {
  shop: [
    { name: "All Products", href: "/shop" },
    { name: "Featured", href: "/shop/featured" },
    { name: "Latest", href: "/shop/latest" },
    { name: "Bestsellers", href: "/shop/bestsellers" },
    { name: "Discounts", href: "/shop/discounts" },
  ],
  categories: [
    { name: "Electronics", href: "/categories/electronics" },
    { name: "Fashion", href: "/categories/fashion" },
    { name: "Home & Living", href: "/categories/home-living" },
    { name: "Beauty", href: "/categories/beauty" },
    { name: "Sports", href: "/categories/sports" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Shipping Policy", href: "/shipping" },
  ],
  support: [
    { name: "FAQs", href: "/faqs" },
    { name: "Returns", href: "/returns" },
    { name: "Track Order", href: "/track-order" },
    { name: "Customer Service", href: "/support" },
    { name: "Size Guide", href: "/size-guide" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center gap-4 md:h-24 md:flex-row md:justify-between md:gap-0">
        <div className="text-center md:text-left">
          <p className="text-sm leading-loose text-muted-foreground md:text-base">
            Built by{" "}
            <a
              href="#"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Your Name
            </a>
            . The source code is available on{" "}
            <a
              href="#"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              GitHub
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
} 