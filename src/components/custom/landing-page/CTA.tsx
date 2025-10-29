import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, CheckCircle, Clock, Users, Shield } from "lucide-react";

const CTA = () => {
  const benefits = [
    { icon: Clock, text: "15-day implementation" },
    { icon: Users, text: "Unlimited team members" },
    { icon: Shield, text: "Enterprise-grade security" },
    { icon: CheckCircle, text: "24/7 customer support" },
  ];

  return (
    <section className="relative overflow-hidden py-24">
      <div className="relative z-10 container mx-auto px-4">
        <Card className="shadow-elevated mx-auto max-w-4xl border-0 bg-[#084f95] p-12 text-center md:p-16">
          {/* Main Heading */}
          <h2 className="text-primary-foreground mb-6 text-4xl font-bold md:text-6xl">
            Ready to Transform Your
            <span className="block text-orange-500">
              Construction Projects?
            </span>
          </h2>

          {/* Subheading */}
          <p className="text-primary-foreground/90 mx-auto mb-8 max-w-2xl text-xl md:text-2xl">
            Join construction leaders who&apos;ve eliminated project chaos and
            improved efficiency by 87% with Uniglaze ERP.
          </p>

          {/* Benefits Grid */}
          <div className="mb-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-primary-foreground/10 flex items-center gap-3 rounded-lg p-4"
              >
                <benefit.icon className="text-accent h-5 w-5 flex-shrink-0" />
                <span className="text-primary-foreground text-sm font-medium">
                  {benefit.text}
                </span>
              </div>
            ))}
          </div>

          {/* CTA Buttons
          <div className="mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              variant="construction"
              size="lg"
              className="h-auto bg-orange-500 px-10 py-4 text-lg font-semibold text-white"
            >
              Start Your Free Trial
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary h-auto px-8 py-4 text-lg"
            >
              Schedule Demo
            </Button>
          </div> */}

          {/* Trust Indicators */}
          <div className="text-primary-foreground/80 text-sm">
            <p className="mb-2">
              <strong>No credit card required</strong> • 15-day free trial •
              Cancel anytime
            </p>
            <p>Setup support included • Data migration assistance available</p>
          </div>
        </Card>

        {/* Additional Info Cards */}
        <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-3">
          <Card className="bg-card/80 border-border/50 p-6 text-center backdrop-blur-sm">
            <div className="-mb-2 text-2xl font-bold text-[#084f95]">
              3 weeks
            </div>
            <div className="text-muted-foreground text-sm">
              Average implementation time
            </div>
          </Card>

          <Card className="bg-card/80 border-border/50 p-6 text-center text-green-500 backdrop-blur-sm">
            <div className="text-success -mb-2 text-2xl font-bold">87%</div>
            <div className="text-muted-foreground text-sm">
              Efficiency improvement
            </div>
          </Card>

          <Card className="bg-card/80 border-border/50 p-6 text-center backdrop-blur-sm">
            <div className="-mb-2 text-2xl font-bold text-orange-500">
              99.9%
            </div>
            <div className="text-muted-foreground text-sm">System uptime</div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default CTA;
