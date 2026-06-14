import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CoachList from "@/components/coach/CoachList";

export const metadata: Metadata = {
  title: "Browse Coaches",
  description: "Find and book professional coaches across multiple specialties.",
};

export default function CoachesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Find a Coach</h1>
          <p className="text-muted-foreground">
            Browse verified professional coaches and book a session today.
          </p>
        </div>
        <CoachList />
      </main>
      <Footer />
    </div>
  );
}
