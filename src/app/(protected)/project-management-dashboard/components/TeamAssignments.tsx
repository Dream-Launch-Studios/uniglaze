import React from "react";
import Icon, { type IconName } from "@/components/rocket/components/AppIcon";
import Image from "@/components/rocket/components/AppImage";

interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  status: "Active" | "Break" | "Offline";
  customRole: "Project Manager" | "Site Engineer" | "Supervisor" | "Worker";
  lastSeen: string;
  currentTask?: string;
}

interface TeamAssignmentsProps {
  teamMembers: TeamMember[];
}

const TeamAssignments: React.FC<TeamAssignmentsProps> = ({ teamMembers }) => {
  const getRoleColor = (customRole: TeamMember["customRole"]): string => {
    return "bg-primary/5 text-primary";
  };

  const getStatusColor = (status: TeamMember["status"]): string => {
    return "bg-primary";
  };

  return (
    <div className="bg-card border-border rounded-lg border p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Icon name="Users" size={20} color="var(--color-primary)" />
          <h3 className="text-text-primary text-lg font-semibold">
            Team Assignments
          </h3>
        </div>
        <span className="text-text-secondary text-sm">
          {teamMembers.filter((m: TeamMember) => m.status === "Active").length}{" "}
          Active
        </span>
      </div>

      <div className="space-y-3">
        {teamMembers.map((member: TeamMember) => (
          <div
            key={member.id}
            className="hover:bg-muted/50 transition-smooth flex items-center space-x-3 rounded-md p-2"
          >
            <div className="relative">
              <Image
                src={member.avatar}
                alt={member.name}
                className="h-8 w-8 rounded-full object-cover"
                width={32}
                height={32}
              />
              <div
                className={`border-card absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 ${getStatusColor(member.status)}`}
              ></div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-text-primary truncate text-sm font-medium">
                  {member.name}
                </h4>
                <span className="text-text-secondary text-xs">
                  {member.lastSeen}
                </span>
              </div>
              <div className="mt-1 flex items-center space-x-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${getRoleColor(member.customRole)}`}
                >
                  {member.customRole}
                </span>
                {member.currentTask && (
                  <span className="text-text-secondary truncate text-xs">
                    {member.currentTask}
                  </span>
                )}
              </div>
            </div>

            <button className="hover:bg-muted transition-smooth rounded-md p-1">
              <Icon
                name="MessageCircle"
                size={16}
                color="var(--color-text-secondary)"
              />
            </button>
          </div>
        ))}
      </div>

      <div className="border-border mt-4 border-t pt-4">
        <button className="text-primary hover:bg-primary/5 transition-smooth flex w-full items-center justify-center space-x-2 rounded-md py-2 text-sm">
          <Icon name="UserPlus" size={16} />
          <span>Add Team Member</span>
        </button>
      </div>
    </div>
  );
};

export default TeamAssignments;
