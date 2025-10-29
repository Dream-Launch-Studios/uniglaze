"use client";

import Button from "@/components/rocket/components/ui/Button";
import { APP_PATHS } from "@/config/path.config";
import { useRouter } from "next/navigation";

export const OnboardingButton = () => {
  const router = useRouter();
  return (
    <div
      className="mr-2 max-w-fit"
      onClick={() => {
        router.push(APP_PATHS.NEW_USER_ONBOARDING);
      }}
    >
      <Button className="rounded-full p-2" iconName="Plus">
        Add New User
      </Button>
    </div>
  );
};

export default OnboardingButton;
