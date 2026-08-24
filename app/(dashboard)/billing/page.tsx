import { CreditCard, ExternalLink } from "lucide-react"
import { PricingTable } from "@clerk/nextjs"

// Clerk's <PricingTable/> throws on mount when Billing is switched off for the
// instance, so it stays unmounted until this is explicitly turned on. Flip it
// after enabling Billing in the Clerk dashboard and defining the plans.
const isBillingEnabled =
  process.env.NEXT_PUBLIC_CLERK_BILLING_ENABLED === "true"

// Shown while Billing is off, so the route stays reachable and says what to do
// rather than crashing behind a dev overlay.
function BillingSetup() {
  return (
    <div className="rounded-xl border border-dashed border-white/[0.12] bg-white/[0.025] p-6">
      <div className="mb-4 grid size-11 place-items-center rounded-[12px] border border-[rgba(91,140,255,0.24)] bg-[linear-gradient(160deg,rgba(91,140,255,0.18),rgba(255,255,255,0.03))]">
        <CreditCard className="size-5 text-[#C9D6FF]" strokeWidth={1.8} />
      </div>

      <h2 className="mb-1.5 text-[15px] font-semibold">Billing isn&apos;t enabled yet</h2>
      <p className="mb-5 max-w-prose text-[13px] leading-[1.6] text-[#7C8494]">
        Plans and checkout are handled by Clerk Billing, which is switched off
        for this instance. Until it&apos;s on, the Agent node and session
        replays stay locked for every organization.
      </p>

      <ol className="mb-5 flex flex-col gap-2.5 text-[13px] leading-[1.6] text-[#B7BEC9]">
        <li className="flex gap-2.5">
          <span className="font-mono text-[11px] text-[#5B8CFF]">01</span>
          <span>
            Enable Billing in the Clerk dashboard under{" "}
            <span className="font-mono text-[11px] text-[#8CA8FF]">
              Billing → Settings
            </span>
            .
          </span>
        </li>
        <li className="flex gap-2.5">
          <span className="font-mono text-[11px] text-[#5B8CFF]">02</span>
          <span>
            Create an organization plan with the slug{" "}
            <span className="font-mono text-[11px] text-[#8CA8FF]">pro</span> —
            that exact slug is what gates the Agent node and replays.
          </span>
        </li>
        <li className="flex gap-2.5">
          <span className="font-mono text-[11px] text-[#5B8CFF]">03</span>
          <span>
            Set{" "}
            <span className="font-mono text-[11px] text-[#8CA8FF]">
              NEXT_PUBLIC_CLERK_BILLING_ENABLED=true
            </span>{" "}
            in .env.local and restart the dev server.
          </span>
        </li>
      </ol>

      <a
        href="https://dashboard.clerk.com/last-active?path=billing/settings"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-[11px] bg-[linear-gradient(160deg,#7CA0FF,#3D63F5)] px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_12px_26px_-12px_rgba(61,99,245,0.95),inset_0_1px_0_rgba(255,255,255,0.35)]"
      >
        Open Clerk Billing settings
        <ExternalLink className="size-3.5" />
      </a>
    </div>
  )
}

export default function BillingPage() {
  return (
    <div className="size-full overflow-y-auto bg-[#0A0B0F]">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 p-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
          <p className="text-sm text-[#7C8494]">
            Choose a plan for your organization. Upgrades and checkout happen
            right here.
          </p>
        </div>
        {isBillingEnabled ? (
          <PricingTable
            for="organization"
            newSubscriptionRedirectUrl="/billing"
          />
        ) : (
          <BillingSetup />
        )}
      </div>
    </div>
  )
}
