import { auth } from "@clerk/nextjs/server"

import { HomeContent } from "./home-content"

export default async function Page() {
  // Redirects signed-out visitors to sign-in. Same resource-based pattern as
  // app/test/page.tsx — no route matching in proxy.ts, since Clerk deprecated
  // createRouteMatcher in favor of per-page checks.
  await auth.protect()

  return <HomeContent />
}
