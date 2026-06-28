import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Terms of Service — ${APP_NAME}`,
};

const LAST_UPDATED = "June 2026";

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="container max-w-3xl py-12 md:py-16">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: {LAST_UPDATED}</p>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p>
              By accessing or using {APP_NAME} (the &ldquo;Platform&rdquo;), you agree to be bound by
              these Terms of Service. If you do not agree, please do not use the Platform.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">2. The Service</h2>
            <p>
              {APP_NAME} connects students with independent coaches and lets them browse
              availability, book sessions, and pay online. {APP_NAME} provides the booking and
              payment tools; coaches are independent providers responsible for the services they
              deliver. {APP_NAME} is not a party to the agreement between a student and a coach.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">3. Accounts</h2>
            <p>
              You sign in using LINE Login. You are responsible for activity under your account and
              for keeping your LINE credentials secure. You must provide accurate information and be
              legally able to enter into contracts.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">4. Bookings &amp; Payments</h2>
            <p>
              Payments are processed by our third-party provider (ECPay). A booking is confirmed only
              after payment is verified. Prices are set by individual coaches. Refunds and
              cancellations are subject to the coach&rsquo;s policy and applicable law; contact the
              coach or our support team for assistance.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">5. Coach Responsibilities</h2>
            <p>
              Coaches are responsible for the accuracy of their profile, the lawfulness of their
              services, honoring confirmed bookings, and complying with tax and professional
              obligations. {APP_NAME} may review, suspend, or remove coach accounts that violate
              these Terms.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">6. Acceptable Use</h2>
            <p>
              You agree not to misuse the Platform, including attempting to disrupt it, circumvent
              payments, harass other users, or use it for unlawful purposes.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">7. Disclaimers &amp; Liability</h2>
            <p>
              The Platform is provided &ldquo;as is&rdquo; without warranties of any kind. To the
              maximum extent permitted by law, {APP_NAME} is not liable for the conduct of coaches or
              students, or for indirect or consequential damages arising from use of the Platform.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">8. Changes</h2>
            <p>
              We may update these Terms from time to time. Continued use after changes take effect
              constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">9. Contact</h2>
            <p>
              Questions about these Terms? Reach us through the Help Center or your LINE Official
              Account.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
