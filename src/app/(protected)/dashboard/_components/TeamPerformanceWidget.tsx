"use client";

import React from "react";
import Icon from "../../../../components/rocket/components/AppIcon";
import Button from "../../../../components/rocket/components/ui/Button";

interface TeamMember {
  id: string | number;
  name: string;
  customRole: string;
  performanceScore: number;
  activeProjects: number;
  reportsSubmitted: number;
}

interface TeamPerformanceWidgetProps {
  teamMembers: TeamMember[];
}

interface PerformanceBadge {
  label: string;
  color: string;
}

const TeamPerformanceWidget: React.FC<TeamPerformanceWidgetProps> = ({
  teamMembers,
}) => {
  const getPerformanceColor = (score: number): string => {
    if (score >= 90) return "text-success";
    if (score >= 75) return "text-primary";
    if (score >= 60) return "text-warning";
    return "text-error";
  };

  const getPerformanceBadge = (score: number): PerformanceBadge => {
    if (score >= 90)
      return { label: "Excellent", color: "bg-success/10 text-success" };
    if (score >= 75)
      return { label: "Good", color: "bg-primary/10 text-primary" };
    if (score >= 60)
      return { label: "Average", color: "bg-warning/10 text-warning" };
    return { label: "Needs Improvement", color: "bg-error/10 text-error" };
  };

  const sortedMembers = [...(teamMembers ?? [])]?.sort(
    (a, b) => b.performanceScore - a.performanceScore,
  );

  return (
    <div className="bg-card border-border rounded-lg border">
      <div className="border-border border-b p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-text-primary text-lg font-semibold">
            Team Performance
          </h2>
          <Button variant="ghost" size="sm" iconName="Users" iconSize={16} />
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {sortedMembers.length === 0 ? (
          <div className="p-6 text-center">
            <Icon
              name="Users"
              size={48}
              color="var(--color-text-secondary)"
              className="mx-auto mb-3"
            />
            <p className="text-text-secondary">No team members found</p>
          </div>
        ) : (
          <div className="divide-border divide-y">
            {sortedMembers.map((member, index) => {
              const badge = getPerformanceBadge(member.performanceScore);
              return (
                <div
                  key={member.id}
                  className="hover:bg-muted/50 transition-smooth p-4"
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                        <Icon
                          name="User"
                          size={20}
                          color="var(--color-primary)"
                        />
                      </div>
                      {index < 3 && (
                        <div className="bg-accent text-accent-foreground absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold">
                          {index + 1}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center justify-between">
                        <h3 className="text-text-primary truncate text-sm font-medium">
                          {member.name}
                        </h3>
                        <span
                          className={`text-sm font-semibold ${getPerformanceColor(member.performanceScore)}`}
                        >
                          {member.performanceScore}%
                        </span>
                      </div>

                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-text-secondary text-xs">
                          {member.customRole}
                        </p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="bg-muted h-1.5 w-full rounded-full">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              member.performanceScore >= 90
                                ? "bg-success"
                                : member.performanceScore >= 75
                                  ? "bg-primary"
                                  : member.performanceScore >= 60
                                    ? "bg-warning"
                                    : "bg-error"
                            }`}
                            style={{ width: `${member.performanceScore}%` }}
                          />
                        </div>

                        <div className="text-text-secondary flex justify-between text-xs">
                          <span>Projects: {member.activeProjects}</span>
                          <span>Reports: {member.reportsSubmitted}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamPerformanceWidget;
