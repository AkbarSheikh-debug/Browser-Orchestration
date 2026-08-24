import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import prettyMilliseconds from "pretty-ms"

import {
  nodeRegistry,
  type StepNodeType,
} from "@/features/workflows/nodes/node-registry"
import { useLatestRunSteps } from "@/features/workflows/components/workflow-runs-provider"
import { cn } from "@/lib/utils"

// The pill-shaped connector the design draws where an edge meets the card —
// a flat 24x6 tab centered on the top or bottom edge, not a round dot.
const HANDLE_CLASS =
  "h-1.5! w-6! min-w-0! rounded-[4px]! border! border-white/10! bg-[#2B303C]!"

function StepNodeComponent({ id, data, selected }: NodeProps<StepNodeType>) {
  const { type, kind, title, values } = data
  const def = nodeRegistry[type]
  const Icon = def.icon
  const fields = def.fields.filter((field) => values[field.key])

  // Reflect this node's state in the latest run. A node is only "running" while
  // the run is actually live — once it ends, a node left marked running stops
  // spinning rather than hanging forever.
  const { steps, isLive } = useLatestRunSteps()
  const step = steps.find((s) => s.nodeId === id)
  const isRunning = step?.status === "running" && isLive
  const isFailed = step?.status === "failed"
  const isDone = step?.status === "done"

  // A trigger starts the flow and takes no input, so it has no target handle.
  const hasTarget = kind !== "trigger"

  return (
    <div className="relative w-[330px]">
      {hasTarget && (
        <Handle type="target" position={Position.Top} className={HANDLE_CLASS} />
      )}

      <div className="relative overflow-hidden rounded-[14px] border border-white/[0.09] bg-[linear-gradient(180deg,#171A21,#101217)] shadow-[0_22px_44px_-22px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-[11px] px-[13px] py-[11px]">
          <span
            className={cn(
              "relative grid size-7 shrink-0 place-items-center rounded-[9px]",
              def.accent
            )}
          >
            <Icon className="size-[15px]" strokeWidth={2.1} />
            {isRunning && (
              <span className="pointer-events-none absolute -inset-[3px] animate-spin rounded-[11px] border-2 border-white/90 border-r-transparent border-t-transparent" />
            )}
          </span>

          <span className="text-sm font-semibold tracking-[-0.01em]">
            {title}
          </span>

          <span className="flex-1" />

          {/* The design puts run feedback where the node's kind tag sits when
              idle: a green tick and duration once done, red on failure. */}
          {isFailed ? (
            <span className="font-mono text-[9.5px] text-[#FF4D6A]">FAILED</span>
          ) : isDone && step?.durationMs != null ? (
            <span className="font-mono text-[9.5px] text-[#10E5A0]">
              ✓ {prettyMilliseconds(step.durationMs)}
            </span>
          ) : (
            <span className="font-mono text-[9px] tracking-[0.1em] text-[#5A6273]">
              {def.tag}
            </span>
          )}
        </div>

        {fields.length > 0 && (
          <>
            <div className="h-px bg-white/[0.07]" />
            <div className="flex flex-col gap-[7px] bg-white/[0.015] px-[13px] py-[11px]">
              {fields.map((field) => (
                <div key={field.key} className="flex items-start gap-3">
                  <span className="w-[52px] shrink-0 pt-px font-mono text-[10px] tracking-[0.1em] text-[#5F677A] uppercase">
                    {field.label}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-right text-[12.5px] text-[#D6DBE5]">
                    {values[field.key]}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Selection / status ring, drawn just outside the card so it reads as a
          glow rather than shifting the card's own border. */}
      <div
        className={cn(
          "pointer-events-none absolute -inset-0.5 rounded-[16px] border-[1.5px] border-transparent transition-all duration-200",
          isRunning &&
            "border-[#5B8CFF] shadow-[0_0_28px_-4px_rgba(91,140,255,0.75)]",
          isFailed &&
            "border-[#FF4D6A] shadow-[0_0_28px_-4px_rgba(255,77,106,0.7)]",
          !isRunning &&
            !isFailed &&
            selected &&
            "border-white/25 shadow-[0_0_24px_-6px_rgba(255,255,255,0.35)]"
        )}
      />

      <Handle type="source" position={Position.Bottom} className={HANDLE_CLASS} />
    </div>
  )
}

export const StepNode = memo(StepNodeComponent)
