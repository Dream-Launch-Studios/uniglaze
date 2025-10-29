import { APP_PATHS } from "@/config/path.config";
import { auth } from "@/server/auth";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

const CallbackPage = async () => {
  const session = await auth();

  if (!session.user.id) redirect(APP_PATHS.LOGIN);
  if (session.user.customRole === Role.MANAGING_DIRECTOR)
    redirect(APP_PATHS.MD_DASHBOARD);
  if (session.user.customRole === Role.HEAD_OF_PLANNING)
    redirect(APP_PATHS.HOD_DASHBAORD);
  if (session.user.customRole === Role.PROJECT_MANAGER)
    redirect(APP_PATHS.PM_DASHBAORD);
};

export default CallbackPage;
