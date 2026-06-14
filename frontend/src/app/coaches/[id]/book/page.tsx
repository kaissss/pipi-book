import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import BookingFlow from "./BookingFlow";

export const metadata: Metadata = {
  title: "Book a Session",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BookPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container py-8 max-w-2xl">
        <BookingFlow coachId={id} />
      </main>
    </div>
  );
}
