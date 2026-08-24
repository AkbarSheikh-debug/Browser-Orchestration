"use client"

import { useOrganization } from "@clerk/nextjs"
import { AvatarStack } from "@liveblocks/react-ui"

import { cn } from "@/lib/utils"
import { useConsoleRuns } from "@/features/workflows/components/workflow-runs-provider"

// The status pill the design puts beside the workflow name — a coloured dot and
// a mono label reflecting the newest run.
function StatusChip() {
  const runs = useConsoleRuns()
  const latest = runs[0]

  const { label, color } = !latest
    ? { label: "DRAFT", color: "#6E7684" }
    : latest.isLive
      ? { label: "RUNNING", color: "#5B8CFF" }
      : latest.status === "COMPLETED"
        ? { label: "PASSED", color: "#10E5A0" }
        : { label: latest.status, color: "#FF4D6A" }

  return (
    <div
      className="flex items-center gap-1.5 rounded-full border px-2.5 py-1"
      style={{ borderColor: `${color}3d`, background: `${color}1a` }}
    >
      <span
        className="size-[5px] rounded-full"
        style={{ background: color, boxShadow: `0 0 8px ${color}` }}
      />
      <span
        className="font-mono text-[10px] tracking-[0.1em]"
        style={{ color }}
      >
        {label}
      </span>
    </div>
  )
}

// The canvas header: org / workflow breadcrumb, run status, and who else is here.
export function WorkflowTopbar({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  const { organization } = useOrganization()

  return (
    <div
      className={cn(
        "flex h-14 shrink-0 items-center gap-3 border-b border-white/[0.06] bg-[rgba(10,11,15,0.8)] px-[18px]",
        className
      )}
    >
      <span className="truncate font-mono text-xs text-[#5A6273]">
        {organization?.slug ?? organization?.name ?? "personal"}
      </span>
      <span className="text-[#333A47]">/</span>
      <span className="truncate text-sm font-semibold tracking-[-0.01em]">
        {name}
      </span>
      <StatusChip />
      <span className="flex-1" />
      {/* Everyone currently in this workflow's Liveblocks room. */}
      <AvatarStack />
    </div>
  )
}
