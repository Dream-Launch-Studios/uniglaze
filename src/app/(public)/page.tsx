import CTA from "@/components/custom/landing-page/CTA";
import Features from "@/components/custom/landing-page/Features";
import Footer from "@/components/custom/landing-page/Footer";
import Hero from "@/components/custom/landing-page/Hero";
import Navbar from "@/components/custom/landing-page/Navbar";
import ProblemSolution from "@/components/custom/landing-page/ProblemSolution";
import UserRoles from "@/components/custom/landing-page/UserRoles";
import { HydrateClient } from "@/trpc/server";

export default async function Home() {
  return (
    <HydrateClient>
      <div className="bg-background min-h-screen">
        <Navbar />
        <Hero />
        <Features />
        <ProblemSolution />
        <UserRoles />
        <CTA />
        <Footer />
      </div>
    </HydrateClient>
  );
}
