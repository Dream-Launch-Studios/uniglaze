import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";
import heroImage from "@/../public/image.png";
import Image from "next/image";
import { InstallPwaButton } from "./install-pwa-button";

const Hero = () => {
  return (
    <section className="bg-white min-h-screen flex items-center py-20">
      <div className="container mx-auto px-4 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - About Section */}
          <div>
            {/* Decorative Stars */}
            {/* <div className="mb-6 flex items-center gap-2">
              <Star className="h-5 w-5 fill-blue-900 text-blue-900" />
              <Star className="h-5 w-5 fill-gray-300 text-gray-300" />
            </div> */}

            {/* Heading */}
            <h1 className="mb-6 text-4xl md:text-5xl lg:text-6xl font-bold text-black">
              Uniglaze India
            </h1>

            {/* Paragraph */}
            <p className="mb-8 text-base md:text-lg text-black leading-relaxed max-w-xl">
              Established in 2016, Uniglaze facade has been a pioneering force
              in the realm of architectural facades. Our firm is distinguished
              by its commitment to delivering unparalleled projects, setting new
              benchmarks in the industry. Specializing in avant-garde facade
              design and implementation, we pride ourselves on transforming
              architectural visions into reality.
            </p>

            {/* Primary actions */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                size="lg"
                className="bg-blue-900 hover:bg-blue-800 text-white rounded-full px-8 py-6 h-auto"
              >
                Learn More
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              {/* This button only shows on devices/browsers where the PWA can be installed */}
              <InstallPwaButton label="Install app on your device" />
            </div>
          </div>

          {/* Right Column - Building Image */}
          <div className="relative">
            <div className="relative rounded-tr-3xl rounded-3xl overflow-hidden">
              <Image
                src={heroImage}
                alt="Modern architectural building complex with green elements"
                className="w-full h-auto object-cover"
                width={800}
                height={600}
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
