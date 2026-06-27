import Link from "next/link";
import { BookOpen } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container py-10 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary mb-3">
              <BookOpen className="h-5 w-5" />
              {APP_NAME}
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Connect with professional coaches and book sessions directly through LINE.
              Your growth journey starts here.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/coaches" className="hover:text-foreground transition-colors">Find Coaches</Link></li>
              <li><Link href="/member/become-coach" className="hover:text-foreground transition-colors">Become a Coach</Link></li>
              <li><Link href="/#how-it-works" className="hover:text-foreground transition-colors">How it Works</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/help" className="hover:text-foreground transition-colors">Help Center</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
          <p>Powered by LINE Login &amp; ECPay</p>
        </div>
      </div>
    </footer>
  );
}
