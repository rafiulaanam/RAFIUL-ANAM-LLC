import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How long does shipping take?",
    answer:
      "Shipping times vary depending on your location. Domestic orders typically arrive within 2-5 business days, while international orders may take 7-14 business days. You'll receive a tracking number once your order ships.",
  },
  {
    question: "What is your return policy?",
    answer:
      "We offer a 30-day return policy for most items. Products must be unused and in their original packaging. Simply contact our customer service team to initiate a return, and we'll provide a prepaid shipping label.",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "Yes, we ship to most countries worldwide. International shipping costs and delivery times vary by location. You can see the exact shipping cost during checkout after entering your address.",
  },
  {
    question: "How can I track my order?",
    answer:
      "Once your order ships, you'll receive a confirmation email with a tracking number. You can use this number on our website or the carrier's website to track your package's progress.",
  },
  {
    question: "Are my payment details secure?",
    answer:
      "Yes, we use industry-standard SSL encryption to protect your payment information. We partner with trusted payment processors and never store your credit card details on our servers.",
  },
  {
    question: "Can I modify or cancel my order?",
    answer:
      "You can modify or cancel your order within 1 hour of placing it. After that, the order enters our fulfillment process and cannot be changed. Please contact customer service for assistance.",
  },
];

export default function Faq() {
  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Find answers to common questions about our products, shipping, returns, and more.
          </p>
        </div>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="text-center mt-12">
            <p className="text-muted-foreground">
              Still have questions?{" "}
              <a
                href="#contact"
                className="text-primary hover:underline font-medium"
              >
                Contact our support team
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
} 