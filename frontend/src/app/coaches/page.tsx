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
        <CoachList />
      </main>
      <Footer />
    </div>
  );
}
