import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Help Center — ${APP_NAME}`,
};

const FAQS: { category: string; items: { q: string; a: string }[] }[] = [
  {
    category: "Getting started",
    items: [
      {
        q: "How do I sign in?",
        a: "Tap “Login with LINE”. We use LINE Login, so there’s no separate password to remember — just authorize once and you’re in.",
      },
      {
        q: "Is it free to join?",
        a: "Creating an account is free. You only pay when you book a session with a coach.",
      },
    ],
  },
  {
    category: "Booking a session",
    items: [
      {
        q: "How do I book a coach?",
        a: "Open “Find Coaches”, choose a coach, pick a service and an available time slot, then pay to confirm. Your booking is confirmed once payment is verified.",
      },
      {
        q: "How do I pay?",
        a: "Payments are handled securely by ECPay. We never store your card details. A booking stays pending until payment succeeds.",
      },
      {
        q: "Can I cancel or reschedule?",
        a: "You can cancel pending or confirmed bookings from “My Bookings”. Refund eligibility depends on the coach’s cancellation policy and applicable law.",
      },
      {
        q: "Will I get reminders?",
        a: "Yes — booking confirmations and reminders are sent to you through LINE.",
      },
    ],
  },
  {
    category: "Becoming a coach",
    items: [
      {
        q: "How do I become a coach?",
        a: "From the account menu choose “Become a Coach” and fill in your profile. You’ll get access to the Coach Portal right away to set up services and availability.",
      },
      {
        q: "When can clients book me?",
        a: "Your profile becomes publicly listable and bookable once an admin reviews and approves it. You can prepare your services and schedule while approval is pending.",
      },
    ],
  },
  {
    category: "Account",
    items: [
      {
        q: "How do I switch between coach and member views?",
        a: "If you’re both a coach and a member, use the “Switch to…” option in the account menu to move between portals.",
      },
      {
        q: "How do I update my profile?",
        a: "Open “Profile” from the account menu to edit your details.",
      },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="container max-w-3xl py-12 md:py-16">
        <h1 className="text-3xl font-bold mb-2">Help Center</h1>
        <p className="text-sm text-muted-foreground mb-10">
          Answers to common questions about using {APP_NAME}.
        </p>

        <div className="space-y-10">
          {FAQS.map((group) => (
            <section key={group.category} className="space-y-4">
              <h2 className="text-lg font-semibold">{group.category}</h2>
              <dl className="space-y-4">
                {group.items.map((item) => (
                  <div key={item.q} className="rounded-lg border p-4">
                    <dt className="font-medium text-sm">{item.q}</dt>
                    <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.a}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-lg bg-muted/50 p-6 text-center">
          <p className="font-medium">Still need help?</p>
          <p className="text-sm text-muted-foreground mt-1">
            Reach us through your LINE Official Account, or review our{" "}
            <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
