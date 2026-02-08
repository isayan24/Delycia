import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  { q: "How does the free trial work?", a: "Sign up and get full access to all features for 14 days — no credit card required. At the end of the trial, choose a plan that fits your needs." },
  { q: "Do I need special hardware?", a: "No! Customers just need their smartphone to scan QR codes. You only need a device to access the dashboard — any laptop, tablet, or phone works." },
  { q: "Can I update my menu anytime?", a: "Absolutely. You can add, edit, or remove menu items in real-time. Changes are reflected instantly on the digital menu." },
  { q: "What payment methods do you accept?", a: "We accept all major payment methods including UPI, credit/debit cards, and net banking through our secure payment gateway." },
  { q: "Is there a setup fee?", a: "No setup fees at all. You can get started in under 2 minutes with zero upfront costs." },
  { q: "Can I cancel anytime?", a: "Yes, you can cancel your subscription at any time with no penalties. Your data will be available for 30 days after cancellation." },
  { q: "Do you offer multi-restaurant support?", a: "Yes! Our yearly plan includes multi-restaurant support so you can manage all your locations from a single dashboard." },
  { q: "What kind of support do you provide?", a: "We offer email and chat support for all plans, plus priority support and a dedicated account manager for yearly plan subscribers." },
];

export default function FAQSection() {
  return (
    <section className="section-padding bg-secondary">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-4 text-foreground">
          Frequently Asked <span className="gradient-text">Questions</span>
        </h2>
        <p className="text-center text-muted-foreground mb-12">
          Everything you need to know about Delycia
        </p>
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((f, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="glass rounded-xl px-6 border-none data-[state=open]:ring-2 data-[state=open]:ring-primary/20"
            >
              <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline py-4">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground pb-4">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
