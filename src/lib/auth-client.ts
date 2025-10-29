import { createAuthClient } from "better-auth/react";
import { adminClient, apiKeyClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [adminClient(), apiKeyClient()],
});

export const { signIn, signOut, useSession } = authClient;
