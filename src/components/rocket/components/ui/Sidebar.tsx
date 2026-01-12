"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Icon from "../AppIcon";
import { signOut, useSession } from "@/lib/auth-client";
import { Role } from "@prisma/client";
import type { Session } from "@/server/auth";
import type * as LucideIcons from "lucide-react";

interface NavigationItem {
  label: string;
  path: string;
  icon: keyof typeof LucideIcons;
  roles: Role[];
  badge: number | null;
}

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const pathname = usePathname();
  const router = useRouter();

  const { data: session } = useSession() as { data: Session | null };

  const navigationItems: NavigationItem[] = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: "LayoutDashboard",
      roles: [
        Role.MANAGING_DIRECTOR,
        Role.HEAD_OF_PLANNING,
        Role.PROJECT_MANAGER,
      ],
      badge: null,
    },
    {
      label: "Projects",
      path: "/project-management-dashboard",
      icon: "FolderOpen",
      roles: [
        Role.MANAGING_DIRECTOR,
        Role.HEAD_OF_PLANNING,
        Role.PROJECT_MANAGER,
      ],
      badge: null,
    },
    {
      label: "Create Project",
      path: "/project-creation",
      icon: "Plus",
      roles: [Role.MANAGING_DIRECTOR, Role.HEAD_OF_PLANNING],
      badge: null,
    },
    {
      label: "Team Management",
      path: "/team-management",
      icon: "Users",
      roles: [Role.MANAGING_DIRECTOR, Role.HEAD_OF_PLANNING],
      badge: null,
    },
    // {
    //   label: "Daily Reports",
    //   path: "/daily-progress-report",
    //   icon: "FileText",
    //   roles: [Role.MANAGING_DIRECTOR, Role.HEAD_OF_PLANNING],
    //   badge: null,
    // },
    {
      label: "Photo Gallery",
      path: "/photo-gallery-management",
      icon: "Camera",
      roles: [
        Role.MANAGING_DIRECTOR,
        Role.HEAD_OF_PLANNING,
        Role.PROJECT_MANAGER,
      ],
      badge: null,
    },
    {
      label: "Approvals",
      path: "/report-approval-workflow",
      icon: "CheckCircle",
      roles: [
        Role.MANAGING_DIRECTOR,
        Role.HEAD_OF_PLANNING,
        Role.PROJECT_MANAGER,
      ],
      badge: null,
    },
    {
      label: "Blockages",
      path: "/blockage-management",
      icon: "AlertTriangle",
      roles: [
        Role.MANAGING_DIRECTOR,
        Role.HEAD_OF_PLANNING,
        Role.PROJECT_MANAGER,
      ],
      badge: null,
    },
    {
      label: "View Resources",
      path: "/resources",
      icon: "FolderOpen",
      roles: [
        Role.MANAGING_DIRECTOR,
        Role.HEAD_OF_PLANNING,
        Role.PROJECT_MANAGER,
      ],
      badge: null,
    },
    // {
    //   label: "Archive",
    //   path: "/project-archive",
    //   icon: "Archive",
    //   roles: [Role.MANAGING_DIRECTOR, Role.HEAD_OF_PLANNING],
    //   badge: null,
    // },
  ];

  const filteredNavItems = navigationItems.filter((item) =>
    session?.user?.customRole
      ? item.roles.includes(session.user.customRole)
      : false,
  );

  const handleNavigation = (path: string): void => {
    router.push(path);
    setIsMobileOpen(false);
  };

  const handleLogout = async (): Promise<void> => {
    await signOut();
    router.push("/login");
  };

  const isActivePath = (path: string): boolean => {
    return pathname === path;
  };

  if (!session) return null;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`bg-surface border-border fixed top-16 left-0 z-50 h-full border-r transition-all duration-300 ${isCollapsed ? "w-16" : "w-60"} ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} `}
      >
        <div className="flex h-full flex-col">
          {/* User Info */}
          <div className="border-border border-b p-4">
            <div
              className={`flex items-center space-x-3 ${isCollapsed ? "justify-center" : ""}`}
            >
              <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
                <Icon name="User" size={16} className="text-primary" />
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-text-primary truncate text-sm font-medium">
                    {session?.user?.name}
                  </p>
                  <p className="text-text-secondary text-xs capitalize">
                    {session?.user?.customRole === Role.MANAGING_DIRECTOR
                      ? "Managing Director"
                      : session?.user?.customRole === Role.HEAD_OF_PLANNING
                        ? "Head Of Planning"
                        : "Project Manager"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 overflow-y-auto p-4">
            {filteredNavItems.map((item, index) => (
              <button
                key={index}
                onClick={() => handleNavigation(item.path)}
                className={`flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  isActivePath(item.path)
                    ? "bg-primary text-white shadow-sm"
                    : "text-text-secondary hover:bg-muted hover:text-text-primary"
                } ${isCollapsed ? "justify-center space-x-0" : ""} `}
              >
                <Icon name={item.icon} size={20} />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span className="bg-accent text-accent-foreground rounded-full px-2 py-1 text-xs">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="border-border border-t p-4">
            <div
              className={`space-y-2 ${isCollapsed ? "flex flex-col items-center" : ""}`}
            >
              {/* Collapse Toggle */}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={`text-text-secondary hover:bg-muted hover:text-text-primary flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${isCollapsed ? "justify-center space-x-0" : ""} `}
              >
                <Icon
                  name={isCollapsed ? "ChevronRight" : "ChevronLeft"}
                  size={18}
                />
                {!isCollapsed && <span>Collapse</span>}
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className={`text-error hover:bg-error/10 flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${isCollapsed ? "justify-center space-x-0" : ""} `}
              >
                <Icon name="LogOut" size={18} />
                {!isCollapsed && <span>Logout</span>}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Toggle */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="bg-surface border-border fixed top-20 left-4 z-50 rounded-lg border p-2 shadow-lg md:hidden"
      >
        <Icon name="Menu" size={20} />
      </button>
    </>
  );
};

export default Sidebar;
