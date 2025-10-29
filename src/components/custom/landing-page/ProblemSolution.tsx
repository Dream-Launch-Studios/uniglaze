import { Card } from "@/components/ui/card";
import {
  MessageSquare,
  Mail,
  Calendar,
  TrendingDown,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

const ProblemSolution = () => {
  const problems = [
    {
      icon: MessageSquare,
      title: "Lost in WhatsApp Groups",
      description:
        "Critical project updates scattered across multiple chat groups",
    },
    {
      icon: Mail,
      title: "Email Thread Chaos",
      description: "Important decisions buried in endless email conversations",
    },
    {
      icon: Calendar,
      title: "Manual Progress Tracking",
      description: "Time-consuming daily reports with no centralized system",
    },
    {
      icon: TrendingDown,
      title: "Zero Project Visibility",
      description: "Management lacks real-time insights into project status",
    },
  ];

  const solutions = [
    {
      title: "Centralized Communication",
      description: "All project communication in one unified platform",
    },
    {
      title: "Automated Reporting",
      description: "Daily progress reports generated automatically with photos",
    },
    {
      title: "Real-time Visibility",
      description: "Management dashboard with live project status updates",
    },
    {
      title: "Streamlined Approvals",
      description: "Efficient approval workflows with email distribution",
    },
  ];

  return (
    <section className="bg-muted/30 py-24" id="workflow">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="text-foreground mb-6 text-4xl font-bold md:text-5xl">
            From Chaos to <span className="text-cyan-900">Control</span>
          </h2>
          <p className="text-muted-foreground mx-auto max-w-3xl text-xl">
            Transform your construction glass projects from scattered
            communication to streamlined project management
          </p>
        </div>

        <div className="flex:wrap flex items-center justify-center gap-16">
          {/* Problems Side */}
          <div>
            <div className="mb-8 text-center lg:text-left">
              <h3 className="text-destructive mb-4 text-2xl font-bold">
                Current Challenges
              </h3>
              <p className="text-muted-foreground">
                Construction teams struggling with fragmented communication
              </p>
            </div>

            <div className="space-y-4">
              {problems.map((problem, index) => (
                <Card
                  key={index}
                  className="border-destructive/20 bg-destructive/5 p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-destructive/10 mt-1 rounded-lg p-3">
                      <problem.icon className="text-destructive h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-foreground mb-2 font-semibold">
                        {problem.title}
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        {problem.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center lg:justify-start">
            <div className="bg-primary shadow-construction rounded-full p-4">
              <ArrowRight className="text-primary-foreground h-8 w-8" />
            </div>
          </div>

          {/* Solutions Side */}
          <div>
            <div className="mb-8 text-center lg:text-left">
              <h3 className="text-success mb-4 text-2xl font-bold">
                Uniglaze Solution
              </h3>
              <p className="text-muted-foreground">
                Unified platform for construction project excellence
              </p>
            </div>

            <div className="space-y-4">
              {solutions.map((solution, index) => (
                <Card
                  key={index}
                  className="border-success/20 bg-success/5 p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-success/10 mt-1 rounded-lg p-3">
                      <CheckCircle className="text-success h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-foreground mb-2 font-semibold">
                        {solution.title}
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        {solution.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolution;
