import Link from "next/link";
import { ArrowRight, BookOpen, Star, Shield, Zap, Users, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { APP_NAME } from "@/lib/constants";

const FEATURES = [
  {
    icon: CalendarCheck,
    title: "Easy Scheduling",
    description: "Browse real-time availability and book sessions with a few taps.",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Pay with confidence via ECPay or LINE Pay — fully encrypted.",
  },
  {
    icon: Users,
    title: "Verified Coaches",
    description: "All coaches are reviewed and approved before going live.",
  },
  {
    icon: Zap,
    title: "LINE Integration",
    description: "Login with LINE and receive booking reminders right in chat.",
  },
];

const SPECIALTIES = [
  "Life Coaching",
  "Business",
  "Career",
  "Health & Wellness",
  "Fitness",
  "Mindfulness",
  "Leadership",
  "Financial",
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-background pt-16 pb-20 md:pt-24 md:pb-32">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center animate-fade-in">
            <Badge variant="secondary" className="mb-4">
              Powered by LINE Login
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Find Your Perfect
              <span className="text-primary"> Coach</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg mx-auto">
              Connect with certified professional coaches, book sessions instantly, and achieve your goals — all through LINE.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="text-base">
                <Link href="/coaches">
                  Browse Coaches
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base">
                <Link href="/auth/login">Start as Coach</Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                4.9 avg rating
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-primary" />
                500+ sessions booked
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-primary" />
                Verified coaches
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section className="py-12 border-y bg-muted/30">
        <div className="container">
          <p className="text-center text-sm font-medium text-muted-foreground mb-4">
            Popular coaching areas
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {SPECIALTIES.map((s) => (
              <Link key={s} href={`/coaches?specialty=${encodeURIComponent(s)}`}>
                <Badge
                  variant="outline"
                  className="text-sm py-1.5 px-3 cursor-pointer hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                >
                  {s}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24" id="how-it-works">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">How {APP_NAME} Works</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              From browsing to booking in minutes.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <Card key={f.title} className="text-center hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to start your journey?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-sm mx-auto">
            Login with LINE and find a coach who gets you.
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link href="/auth/login">Get Started Free</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
