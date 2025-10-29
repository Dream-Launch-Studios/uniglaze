import {
  AUTH_TOKEN_EXPIRATION_TIME,
  AUTH_TOKEN_UPDATION_TIME,
} from "@/config/auth.config";
import { PrismaClient, Role } from "@prisma/client";
import { betterAuth as betterAuthClient } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin, apiKey } from "better-auth/plugins";
import { headers } from "next/headers";
import { cache } from "react";

const prisma = new PrismaClient();

export const betterAuth = betterAuthClient({
  user: {
    additionalFields: {
      customRole: {
        type: "string",
        required: true,
        input: true,
        defaultValue: Role.PROJECT_MANAGER,
      },
    },
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
  session: {
    expiresIn: AUTH_TOKEN_EXPIRATION_TIME,
    updateAge: AUTH_TOKEN_UPDATION_TIME,
  },
  plugins: [admin(), apiKey(), nextCookies()],
});

export type Session = typeof betterAuth.$Infer.Session & {
  user: { customRole: Role };
};

export const auth = cache(async () => {
  const session = await betterAuth.api.getSession({
    headers: await headers(),
  });
  return session;
}) as () => Promise<Session>;
