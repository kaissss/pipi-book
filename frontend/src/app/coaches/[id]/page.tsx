import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CoachProfileView from "./CoachProfileView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Coach Profile`,
    description: `View profile and book a session`,
  };
}

export default async function CoachDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container py-8 md:py-12">
        <CoachProfileView coachId={id} />
      </main>
      <Footer />
    </div>
  );
}
