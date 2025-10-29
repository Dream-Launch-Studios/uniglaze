import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Crown,
  Users,
  HardHat,
  CheckCircle,
  X,
  Eye,
  Edit,
  Upload,
} from "lucide-react";

const UserRoles = () => {
  const roles = [
    {
      icon: Crown,
      title: "CEO & Head Of Planning",
      subtitle: "Full Control & Oversight",
      color: "bg-orange-500",
      iconColor: "text-primary-foreground",
      users: ["Aditya (CEO)", "Vamsi (Head Of Planning)"],
      permissions: [
        { action: "Create new projects", allowed: true },
        { action: "Set up initial data", allowed: true },
        { action: "View project history", allowed: true },
        { action: "Approve/reject PM reports", allowed: true },
        { action: "Create new user logins", allowed: true },
        { action: "Create new PM accounts", allowed: true },
        { action: "Access all data", allowed: true },
      ],
      features: [
        "Complete CRUD operations",
        "Full project oversight",
        "Team management",
        "Microsoft Teams integration",
        "Advanced analytics dashboard",
      ],
    },
    {
      icon: HardHat,
      title: "Project Managers",
      subtitle: "On-site Data Collection",
      color: "bg-cyan-950",
      iconColor: "text-primary-foreground",
      users: ["10+ On-site Managers"],
      permissions: [
        { action: "View assigned projects", allowed: true },
        { action: "Daily data entry (yesterday's work)", allowed: true },
        { action: "Photo uploads", allowed: true },
        { action: "Blockage reporting", allowed: true },
        { action: "Submit daily reports", allowed: true },
        { action: "Create new projects", allowed: false },
        { action: "Access other projects", allowed: false },
      ],
      features: [
        "Mobile-optimized interface",
        "Photo documentation tools",
        "Daily progress tracking",
        "Blockage reporting system",
        "Time-restricted data entry",
      ],
    },
  ];

  return (
    <section className="bg-muted/30 py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-16 text-center">
          <h2 className="text-foreground mb-6 text-4xl font-bold md:text-5xl">
            Role-Based <span className="text-cyan-900">Access Control</span>
          </h2>
          <p className="text-muted-foreground mx-auto max-w-3xl text-xl">
            Secure, efficient workflows tailored for each team member&apos;s
            responsibilities in construction project management
          </p>
        </div>

        {/* Roles Grid */}
        <div className="mb-16 grid gap-8 lg:grid-cols-2">
          {roles.map((customRole, index) => (
            <Card
              key={index}
              className="border-border/50 p-8 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
            >
              {/* Role Header */}
              <div className="mb-6 flex items-start gap-4">
                <div className={`${customRole.color} rounded-xl p-4`}>
                  <customRole.icon
                    className={`h-8 w-8 ${customRole.iconColor}`}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-foreground mb-2 text-2xl font-bold">
                    {customRole.title}
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    {customRole.subtitle}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {customRole.users.map((user, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {user}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Key Features */}
              <div className="mb-6">
                <h4 className="text-foreground mb-3 font-semibold">
                  Key Features
                </h4>
                <ul className="space-y-2">
                  {customRole.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-500" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Permissions */}
              <div>
                <h4 className="text-foreground mb-3 font-semibold">
                  Permissions
                </h4>
                <div className="space-y-2">
                  {customRole.permissions.map((permission, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm">
                      {permission.allowed ? (
                        <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-500" />
                      ) : (
                        <X className="text-destructive h-4 w-4 flex-shrink-0" />
                      )}
                      <span
                        className={
                          permission.allowed
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }
                      >
                        {permission.action}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Workflow Diagram */}
        <Card className="border bg-neutral-100 p-8">
          <div className="mb-8 text-center">
            <h3 className="text-foreground mb-4 text-2xl font-bold">
              Daily Workflow Process
            </h3>
            <p className="text-muted-foreground">
              Streamlined process ensuring accountability and real-time project
              visibility
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-200 p-4">
                <Upload className="h-6 w-6 text-neutral-500" />
              </div>
              <h4 className="text-foreground mb-2 font-semibold">
                1. Data Entry
              </h4>
              <p className="text-muted-foreground text-sm">
                PMs log yesterday&apos;s progress with photos (10-11 AM)
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-200 p-4">
                <Eye className="h-6 w-6 text-orange-500" />
              </div>
              <h4 className="text-foreground mb-2 font-semibold">2. Review</h4>
              <p className="text-muted-foreground text-sm">
                Management reviews submitted reports on dashboard
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 p-4">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <h4 className="text-foreground mb-2 font-semibold">
                3. Approval
              </h4>
              <p className="text-muted-foreground text-sm">
                CEO/Operations approve or request revisions
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border bg-cyan-50 p-4">
                <Users className="h-6 w-6 text-cyan-950" />
              </div>
              <h4 className="text-foreground mb-2 font-semibold">
                4. Distribution
              </h4>
              <p className="text-muted-foreground text-sm">
                Automated emails sent to internal team and clients
              </p>
            </div>
          </div>
        </Card>

        {/* CTA */}
        {/* <div className="mt-12 text-center">
          <Button
            variant="construction"
            size="lg"
            className="h-auto bg-orange-500 px-8 py-4 text-lg hover:bg-orange-600"
          >
            See Role Demo
          </Button>
        </div> */}
      </div>
    </section>
  );
};

export default UserRoles;
