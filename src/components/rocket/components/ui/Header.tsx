import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import type * as LucideIcons from "lucide-react";

import Icon from "../AppIcon";
import Button from "./Button";
import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "@/lib/auth-client";
import type { Session } from "@/server/auth";
import { Role } from "@prisma/client";

interface NavItem {
  label: string;
  path: string;
  icon: keyof typeof LucideIcons;
}

interface User {
  name?: string;
  email?: string;
  customRole?: string;
}

const Header: React.FC = () => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState<boolean>(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession() as { data: Session | null };

  // Mock user data - replace with actual auth implementation
  const user: User | undefined = {
    name: "John Doe",
    email: "john@example.com",
    customRole: "PM",
  };

  const logout = (): void => {
    // Replace with actual logout implementation
    // console.log("Logout functionality to be implemented");
    void signOut();
  };

  let primaryNavItems: NavItem[] = [];
  let secondaryNavItems: NavItem[] = [];

  if (session?.user?.customRole === Role.PROJECT_MANAGER) {
    primaryNavItems = [
      { label: "Dashboard", path: "/dashboard", icon: "LayoutDashboard" },
      {
        label: "Projects",
        path: "/project-management-dashboard",
        icon: "FolderOpen",
      },
      {
        label: "Approvals",
        path: "/report-approval-workflow",
        icon: "CheckCircle",
      },
    ];

    secondaryNavItems = [
      {
        label: "Photo Gallery",
        path: "/photo-gallery-management",
        icon: "Camera",
      },
      {
        label: "Blockages",
        path: "/blockage-management",
        icon: "AlertTriangle",
      },
    ];
  } else if (
    session?.user?.customRole === Role.HEAD_OF_PLANNING ||
    session?.user?.customRole === Role.MANAGING_DIRECTOR
  ) {
    primaryNavItems = [
      { label: "Dashboard", path: "/dashboard", icon: "LayoutDashboard" },
      {
        label: "Projects",
        path: "/project-management-dashboard",
        icon: "FolderOpen",
      },

      // {
      //   label: "Daily Reports",
      //   path: "/daily-progress-report",
      //   icon: "FileText",
      // },
      {
        label: "Approvals",
        path: "/report-approval-workflow",
        icon: "CheckCircle",
      },
    ];

    secondaryNavItems = [
      { label: "Team Management", path: "/team-management", icon: "Users" },
      { label: "Create Project", path: "/project-creation", icon: "Plus" },
      {
        label: "Photo Gallery",
        path: "/photo-gallery-management",
        icon: "Camera",
      },
      {
        label: "Blockages",
        path: "/blockage-management",
        icon: "AlertTriangle",
      },
      // { label: "Archive", path: "/project-archive", icon: "Archive" },
    ];
  }

  const handleNavigation = (path: string): void => {
    router.push(path);
    setIsMoreMenuOpen(false);
  };

  const handleLogout = (): void => {
    logout();
    router.push("/");
    setIsUserMenuOpen(false);
  };

  const isActivePath = (path: string): boolean => {
    return pathname === path;
  };

  const getUserRoleDisplay = (customRole?: string): string => {
    switch (customRole) {
      case "MD":
        return "Managing Director";
      case "HOP":
        return "Head Of Planning";
      case "PM":
        return "Project Manager";
      default:
        return customRole ?? "Unknown";
    }
  };

  return (
    <header className="bg-surface border-border elevation-1 fixed top-0 right-0 left-0 z-100 border-b">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Logo Section */}
        <Link href="/">
          <Image
            src="https://firebasestorage.googleapis.com/v0/b/plypicker-e35d7.appspot.com/o/dualite%2Funiglaze%2Fcompany%20logo.png?alt=media&token=3f10a9bd-1da3-4c61-b8b5-8c3f8e317f36"
            alt="Uniglazeeeeeeeeeeee"
            width={100}
            height={100}
            className="h-fit w-fit"
          />
        </Link>

        {/* Primary Navigation - Desktop */}
        <nav className="hidden items-center space-x-1 md:flex">
          {primaryNavItems.map((item) => (
            <Button
              key={item.path}
              variant={isActivePath(item.path) ? "default" : "ghost"}
              size="sm"
              iconName={item.icon}
              iconPosition="left"
              iconSize={16}
              onClick={() => handleNavigation(item.path)}
              className="transition-smooth flex items-center justify-center font-medium"
            >
              {item.label}
            </Button>
          ))}

          {/* More Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              iconName="MoreHorizontal"
              iconSize={16}
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              className="transition-smooth"
            >
              More
            </Button>

            {isMoreMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-200"
                  onClick={() => setIsMoreMenuOpen(false)}
                />
                <div className="bg-popover border-border elevation-3 absolute top-full right-0 z-300 mt-2 w-48 rounded-lg border">
                  <div className="py-1">
                    {secondaryNavItems.map((item) => (
                      <button
                        key={item.path}
                        onClick={() => handleNavigation(item.path)}
                        className={`transition-smooth hover:bg-muted flex w-full items-center px-4 py-2.5 text-sm ${
                          isActivePath(item.path)
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-text-primary"
                        }`}
                      >
                        <Icon name={item.icon} size={16} className="mr-3" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="sm"
            iconName="Menu"
            iconSize={20}
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
          />
        </div>

        {/* User Actions */}
        <div className="hidden items-center space-x-2 md:flex">
          {/* <Button variant="ghost" size="sm" iconName="Bell" iconSize={16} />
          <Button variant="ghost" size="sm" iconName="Settings" iconSize={16} /> */}

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="hover:bg-muted transition-smooth flex items-center space-x-2 rounded-lg p-2"
            >
              <div className="bg-primary/10 border-primary/20 flex h-8 w-8 items-center justify-center rounded-full border">
                <Icon name="User" size={16} className="text-primary" />
              </div>
              <div className="text-left">
                <p className="text-text-primary text-sm font-medium">
                  {session?.user?.name ?? "User"}
                </p>
                <p className="text-text-secondary text-xs">
                  {session?.user?.customRole ?? "Role"}
                </p>
              </div>
              <Icon
                name={isUserMenuOpen ? "ChevronUp" : "ChevronDown"}
                size={14}
                className="text-text-secondary"
              />
            </button>

            {isUserMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-200"
                  onClick={() => setIsUserMenuOpen(false)}
                />
                <div className="bg-popover border-border elevation-3 absolute top-full right-0 z-300 mt-2 w-56 rounded-lg border">
                  <div className="border-border space-y-1 border-b p-3">
                    <p className="text-text-primary text-sm font-medium">
                      {session?.user?.name ?? "User"}
                    </p>
                    <p className="text-text-secondary text-xs">
                      {session?.user?.email ?? "user@example.com"}
                    </p>
                    <p className="text-text-secondary text-xs">
                      {session?.user?.customRole ?? "Role"}
                    </p>
                  </div>
                  <div className="py-1">
                    {/* <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        router.push("/dashboard");
                      }}
                      className="text-text-primary hover:bg-muted transition-smooth flex w-full items-center px-3 py-2 text-sm"
                    >
                      <Icon name="LayoutDashboard" size={16} className="mr-3" />
                      Dashboard
                    </button> */}
                    {/* <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        // Navigate to profile/settings if available
                      }}
                      className="text-text-primary hover:bg-muted transition-smooth flex w-full items-center px-3 py-2 text-sm"
                    >
                      <Icon name="Settings" size={16} className="mr-3" />
                      Settings
                    </button> */}
                    {/* <div className="border-border my-1 border-t"></div> */}
                    <button
                      onClick={handleLogout}
                      className="text-error hover:bg-error/10 transition-smooth flex w-full items-center px-3 py-2 text-sm"
                    >
                      <Icon name="LogOut" size={16} className="mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMoreMenuOpen && (
        <div className="bg-background fixed inset-0 top-16 z-200 md:hidden">
          <div className="space-y-1 p-4">
            {[...primaryNavItems, ...secondaryNavItems].map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`transition-smooth flex w-full items-center rounded-lg px-4 py-3 ${
                  isActivePath(item.path)
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-text-primary hover:bg-muted"
                }`}
              >
                <Icon name={item.icon} size={20} className="mr-3" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}

            {/* Mobile User Info and Logout */}
            {user && (
              <>
                <div className="border-border my-2 border-t"></div>
                <div className="px-4 py-2">
                  <p className="text-text-primary text-sm font-medium">
                    {user.name}
                  </p>
                  <p className="text-text-secondary text-xs">
                    {getUserRoleDisplay(user.customRole)}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-error hover:bg-error/10 transition-smooth flex w-full items-center rounded-lg px-4 py-3"
                >
                  <Icon name="LogOut" size={20} className="mr-3" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
