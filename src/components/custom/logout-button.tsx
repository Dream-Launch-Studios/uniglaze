"use client";

import { authClient } from "@/lib/auth-client";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { APP_PATHS } from "@/config/path.config";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push(APP_PATHS.HOME);
  };

  return (
    <Button variant="outline" onClick={handleLogout} className="cursor-pointer">
      Logout <LogOut className="size-4" />
    </Button>
  );
}
