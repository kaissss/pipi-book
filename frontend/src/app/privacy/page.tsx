import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Privacy Policy — ${APP_NAME}`,
};

const LAST_UPDATED = "June 2026";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="container max-w-3xl py-12 md:py-16">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: {LAST_UPDATED}</p>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">1. Overview</h2>
            <p>
              This Privacy Policy explains how {APP_NAME} collects, uses, and protects your personal
              information when you use our Platform.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">2. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <span className="text-foreground font-medium">LINE profile</span> — your LINE user
                ID, display name, profile picture, and, if you grant permission, your email address.
              </li>
              <li>
                <span className="text-foreground font-medium">Account &amp; profile data</span> — for
                coaches, the profile details you provide (bio, specialties, services, availability).
              </li>
              <li>
                <span className="text-foreground font-medium">Booking &amp; payment data</span> —
                bookings you make and payment status. Card details are handled by our payment
                provider (ECPay) and are not stored by {APP_NAME}.
              </li>
              <li>
                <span className="text-foreground font-medium">Usage data</span> — basic technical and
                analytics information needed to operate and improve the service.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">3. How We Use Your Information</h2>
            <p>
              We use your information to authenticate you, create and manage bookings, process
              payments, send booking-related notifications via LINE, provide support, and improve the
              Platform.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">4. Sharing</h2>
            <p>
              We share information only as needed to run the service: with the coach or student
              involved in a booking, and with service providers such as LINE (login and messaging)
              and ECPay (payments). We do not sell your personal information.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">5. Data Retention</h2>
            <p>
              We retain your information for as long as your account is active or as needed to provide
              the service and comply with legal obligations.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">6. Your Rights</h2>
            <p>
              You may request access to, correction of, or deletion of your personal data, subject to
              applicable law. To make a request, contact us through the Help Center or your LINE
              Official Account.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">7. Security</h2>
            <p>
              We use reasonable technical and organizational measures to protect your information. No
              method of transmission or storage is completely secure, however, and we cannot guarantee
              absolute security.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">8. Changes</h2>
            <p>
              We may update this Privacy Policy from time to time. Material changes will be reflected
              by the &ldquo;Last updated&rdquo; date above.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">9. Contact</h2>
            <p>
              For privacy questions or requests, reach us through the Help Center or your LINE
              Official Account.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
