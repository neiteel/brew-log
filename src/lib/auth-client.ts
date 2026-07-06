import type { auth } from "@/lib/auth"

import {
  inferAdditionalFields,
  usernameClient,
} from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  // inferAdditionalFields teaches the client about server-side user fields
  // (e.g. `locale`) so updateUser/session are typed for them.
  plugins: [inferAdditionalFields<typeof auth>(), usernameClient()],
})
