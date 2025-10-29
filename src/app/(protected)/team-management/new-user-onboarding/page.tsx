import { SignupForm } from "@/components/forms/signup-form";
import { APP_PATHS } from "@/config/path.config";
import { auth } from "@/server/auth";
import { Action, Resource } from "@/server/auth/permissions/enums.permission";
import { RBACservice } from "@/server/auth/permissions/service.permissions";
import { redirect } from "next/navigation";
import React from "react";

export default async function NewUserOnboarding() {
  const session = await auth();
  if (!session) redirect(APP_PATHS.LOGIN);

  // const isAllowed = RBACservice.checkPermission(
  //   session.user.customRole,
  //   Action.Create,
  //   Resource.Role,
  // );
  // if (!isAllowed) redirect(APP_PATHS.HOME);

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <SignupForm />
      </div>
    </div>
  );
}
