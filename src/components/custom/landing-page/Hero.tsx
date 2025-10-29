import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, Users, CheckCircle } from "lucide-react";
import heroImage from "@/../public/hero-construction.jpg";
import Image from "next/image";

const Hero = () => {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src={heroImage}
          alt="Construction glass installation"
          className="h-full w-full object-cover"
        />
        <div className="from-primary/60 via-primary/40 absolute inset-0 bg-gradient-to-r to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border-[1px] border-cyan-800 px-4 py-2 backdrop-blur-3xl">
            <CheckCircle className="text-success h-4 w-4" />
            <span className="text-sm font-medium text-white">
              Trusted by Construction Leaders
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="mb-6 text-5xl leading-tight font-bold text-white md:text-7xl">
            Streamline Your
            <span className="to-accent block bg-gradient-to-r from-cyan-200 bg-clip-text text-transparent">
              Glass Construction
            </span>
            Projects
          </h1>

          {/* Subheading */}
          <p className="mb-8 max-w-2xl text-xl text-white/90 md:text-2xl">
            Replace scattered WhatsApp groups and email threads with a unified
            ERP solution designed for construction glass work specialists.
          </p>

          {/* Stats */}
          <div className="mb-10 flex flex-wrap gap-8">
            <div className="flex items-center gap-3">
              <div className="bg-accent/20 rounded-lg p-3 backdrop-blur-sm">
                <Building2 className="text-glass h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">10+</div>
                <div className="text-sm text-white/80">Active Projects</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-accent/20 rounded-lg p-3 backdrop-blur-sm">
                <Users className="text-glass h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">50+</div>
                <div className="text-sm text-white/80">Project Managers</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-accent/20 rounded-lg p-3 backdrop-blur-sm">
                <CheckCircle className="text-success h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">100%</div>
                <div className="text-sm text-white/80">Project Visibility</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 right-10 hidden lg:block">
        <div className="bg-glass/10 border-glass/20 rounded-2xl border p-6 text-white backdrop-blur-sm">
          <div className="mb-1 text-sm text-white/80">
            Today&apos;s Progress
          </div>
          <div className="text-2xl font-bold">87%</div>
          <div className="text-success text-xs">+12% from yesterday</div>
        </div>
      </div>

      <div className="absolute right-20 bottom-32 hidden lg:block">
        <div className="bg-glass/10 border-glass/20 rounded-2xl border p-4 text-white backdrop-blur-sm">
          <div className="mb-1 text-sm text-white/80">Active Teams</div>
          <div className="text-xl font-bold">8</div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
