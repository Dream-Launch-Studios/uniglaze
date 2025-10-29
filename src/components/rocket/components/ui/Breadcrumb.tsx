import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Icon from "../AppIcon";
import { cn } from "@/lib/utils";

// TypeScript interface for breadcrumb items
interface BreadcrumbItem {
  name: string;
  path: string;
  current: boolean;
}

const Breadcrumb: React.FC<{ className?: string }> = ({ className }) => {
  const pathname = usePathname();

  const getBreadcrumbItems = (): BreadcrumbItem[] => {
    const pathnames: string[] = pathname
      .split("/")
      .filter((x: string) => x !== "");

    if (pathnames.length === 0) {
      return [{ name: "Dashboard", path: "/dashboard", current: true }];
    }

    const breadcrumbItems: BreadcrumbItem[] = [];
    let currentPath = "";

    pathnames.forEach((name: string, index: number) => {
      currentPath += `/${name}`;

      // Convert kebab-case to Title Case
      const displayName: string = name
        .split("-")
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      breadcrumbItems.push({
        name: displayName,
        path: currentPath,
        current: index === pathnames.length - 1,
      });
    });

    return breadcrumbItems;
  };

  const breadcrumbItems: BreadcrumbItem[] = getBreadcrumbItems();

  return (
    <nav
      className={cn("mb-6 flex max-w-fit items-center space-x-2", className)}
      aria-label="Breadcrumb"
    >
      <Link
        href="/dashboard"
        className="text-text-secondary hover:text-text-primary transition-smooth flex items-center space-x-1 text-sm"
      >
        <Icon name="Home" size={16} color="var(--color-text-secondary)" />
        <span className="font-medium">Home</span>
      </Link>

      {breadcrumbItems.map((item: BreadcrumbItem, index: number) => (
        <React.Fragment key={item.path}>
          <Icon
            name="ChevronRight"
            size={16}
            color="var(--color-text-secondary)"
          />
          {item.current ? (
            <span className="text-text-primary text-sm font-semibold">
              {item.name}
            </span>
          ) : (
            <Link
              href={item.path}
              className="text-text-secondary hover:text-text-primary transition-smooth text-sm font-medium"
            >
              {item.name}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
