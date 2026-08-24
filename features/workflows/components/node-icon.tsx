import { cn } from "@/lib/utils"

import {
  nodeRegistry,
  type NodeType,
} from "@/features/workflows/nodes/node-registry"

// The accent-gradient icon chip, mirroring the node on the canvas. Pass `running`
// to overlay the spinner ring the design puts around a live step's chip.
export function NodeIcon({
  type,
  running,
  className,
}: {
  type: NodeType
  running?: boolean
  className?: string
}) {
  const def = nodeRegistry[type]
  const Icon = def.icon

  return (
    <span
      className={cn(
        "relative grid size-6 shrink-0 place-items-center rounded-[8px]",
        def.accent,
        className
      )}
    >
      <Icon className="size-3.5" strokeWidth={2.2} />
      {running && (
        <span className="pointer-events-none absolute -inset-[3px] animate-spin rounded-[11px] border-2 border-white/90 border-r-transparent border-t-transparent" />
      )}
    </span>
  )
}
