"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Camera,
  FileText,
  Users,
  CheckCircle,
  Mail,
  BarChart3,
  Shield,
  Smartphone,
  Cloud,
  ArrowRight,
  Clock,
} from "lucide-react";
import glassPattern from "@/../public/glass-pattern.jpg";
import Image from "next/image";

const Features = () => {
  const coreFeatures = [
    {
      icon: Building2,
      title: "Project Creation & Management",
      description:
        "Create detailed project structures with item breakdowns, quantities, and measurements",
      features: [
        "Multi-level project hierarchy",
        "Custom measurement units",
        "Progress tracking",
      ],
    },
    {
      icon: Camera,
      title: "Photo Documentation",
      description:
        "Capture and organize progress photos with location tagging and descriptions",
      features: [
        "4-directional photo capture",
        "Auto location tagging",
        "Gallery integration",
      ],
    },
    {
      icon: FileText,
      title: "Automated Reporting",
      description:
        "Generate comprehensive PDF reports with charts, photos, and progress data",
      features: [
        "Daily progress reports",
        "Visual charts & graphs",
        "Automated distribution",
      ],
    },
    {
      icon: Users,
      title: "Role-Based Access",
      description:
        "Secure user management with customized permissions for different team roles",
      features: [
        "CEO/Operations access",
        "Project Manager portal",
        "Secure authentication",
      ],
    },
    {
      icon: CheckCircle,
      title: "Approval Workflows",
      description:
        "Streamlined approval process with email notifications and status tracking",
      features: [
        "Multi-level approvals",
        "Email notifications",
        "Status tracking",
      ],
    },
    {
      icon: Mail,
      title: "Smart Email Distribution",
      description:
        "Intelligent email routing with client-facing and internal communication separation",
      features: [
        "Client vs internal emails",
        "Automatic distribution",
        "Custom templates",
      ],
    },
  ];

  const technicalFeatures = [
    {
      icon: Cloud,
      title: "AWS Cloud Infrastructure",
      description: "Scalable and reliable cloud deployment",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Role-based access with secure authentication",
    },
    {
      icon: Smartphone,
      title: "Mobile Optimized",
      description: "Perfect for on-site field work",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Real-time insights and progress tracking",
    },
  ];

  return (
    <section className="bg-background py-24" id="features">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-16 text-center">
          <h2 className="text-foreground mb-6 text-4xl font-bold md:text-5xl">
            Complete <span className="text-cyan-900">ERP Solution</span>
          </h2>
          <p className="text-muted-foreground mx-auto max-w-3xl text-xl">
            Every feature designed specifically for construction glass work
            management
          </p>
        </div>

        {/* Core Features Grid */}
        <div className="mb-20 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {coreFeatures.map((feature, index) => (
            <Card
              key={index}
              className="group border-border/50 p-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
            >
              <div className="mb-4">
                <div className="bg-primary/10 group-hover:bg-primary/20 mb-4 w-fit rounded-lg p-3 transition-colors">
                  <feature.icon className="text-primary h-6 w-6" />
                </div>
                <h3 className="text-foreground mb-2 text-xl font-bold">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {feature.description}
                </p>
              </div>

              <ul className="space-y-2">
                {feature.features.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="text-success h-4 w-4 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        {/* Technical Features Section */}
        <div className="relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <Image
              src={glassPattern}
              alt="Glass pattern"
              className="h-full w-full rounded-2xl object-cover"
            />
          </div>

          <div className="bg-gradient-glass relative rounded-2xl border p-8 md:p-12">
            <div className="mb-12 text-center">
              <h3 className="text-foreground mb-4 text-3xl font-bold">
                Built for{" "}
                <span className="text-primary">Scale & Performance</span>
              </h3>
              <p className="text-muted-foreground mx-auto max-w-2xl">
                Enterprise-grade technology stack ensuring reliability,
                security, and seamless user experience
              </p>
            </div>

            <div className="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {technicalFeatures.map((feature, index) => (
                <Card
                  key={index}
                  className="bg-background/50 border-border/30 p-6 text-center backdrop-blur-sm"
                >
                  <div className="bg-primary/10 mx-auto mb-4 w-fit rounded-lg p-3">
                    <feature.icon className="text-primary h-6 w-6" />
                  </div>
                  <h4 className="text-foreground mb-2 font-semibold">
                    {feature.title}
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </Card>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
              <div>
                <div className="text-primary mb-1 text-3xl font-bold">
                  99.9%
                </div>
                <div className="text-muted-foreground text-sm">
                  Uptime Guarantee
                </div>
              </div>
              <div>
                <div className="text-primary mb-1 text-3xl font-bold">
                  &lt; 2s
                </div>
                <div className="text-muted-foreground text-sm">
                  Average Load Time
                </div>
              </div>
              <div>
                <div className="text-primary mb-1 text-3xl font-bold">24/7</div>
                <div className="text-muted-foreground text-sm">
                  Support Available
                </div>
              </div>
              <div>
                <div className="text-primary mb-1 text-3xl font-bold">
                  SOC 2
                </div>
                <div className="text-muted-foreground text-sm">
                  Security Compliant
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
