"use client"

import { useState, useTransition } from "react"
import { useReactFlow, useStore } from "@xyflow/react"
import { Lock, MoreHorizontal, Play, Square, Trash2 } from "lucide-react"
import { toast } from "sonner"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

import {
  cancelWorkflowRunAction,
  deleteWorkflowAction,
  runWorkflowAction,
} from "@/features/workflows/actions"
import { NodeIcon } from "@/features/workflows/components/node-icon"
import {
  useLatestRunSteps,
  useLiveRun,
} from "@/features/workflows/components/workflow-runs-provider"
import { useProPlan } from "@/features/workflows/hooks/use-pro-plan"
import { useUpstreamConnections } from "@/features/workflows/hooks/use-upstream-connections"
import { validateGraph } from "@/features/workflows/lib/validate-graph"
import {
  nodeRegistry,
  type NodeDefinition,
  type NodeField,
  type NodeType,
  type StepNodeKind,
  type StepNodeType,
} from "@/features/workflows/nodes/node-registry"

// This file builds up to the RightSidebar exported at the bottom: a header with
// workflow actions (delete, run), then two tabs — a Toolbar for adding nodes and
// an Editor for tweaking the selected node.

// The mono section rule the design uses to head each group.
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2.5 flex items-center gap-2">
      <span className="font-mono text-[10px] tracking-[0.18em] text-[#61697A]">
        {children}
      </span>
      <span className="h-px flex-1 bg-white/[0.06]" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Editor tab — edits the fields of the selected node.
// ---------------------------------------------------------------------------

// A single editor field. Renders a multi-line textarea when the field opts in
// via `multiline`, otherwise a single-line input. Both wear the design's inset
// slab styling and focus to the accent blue.
function Field({
  field,
  value,
  onChange,
  onFocus,
}: {
  field: NodeField
  value: string
  onChange: (value: string) => void
  // Fires when the field gains focus, so the Connections chips know which
  // field a clicked token should land in.
  onFocus: () => void
}) {
  const className =
    "w-full rounded-[11px] border border-white/[0.09] bg-white/[0.035] px-[13px] py-[11px] font-mono text-[12.5px] leading-[1.6] text-[#DDE2EB] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] outline-none transition-colors placeholder:text-[#5A6273] hover:border-[rgba(91,140,255,0.45)] focus:border-[rgba(91,140,255,0.65)] focus:bg-[rgba(91,140,255,0.05)]"

  if (field.multiline) {
    return (
      <textarea
        id={field.key}
        value={value}
        rows={3}
        placeholder={field.placeholder}
        onFocus={onFocus}
        onChange={(e) => onChange(e.target.value)}
        className={cn(className, "resize-y")}
      />
    )
  }

  return (
    <input
      id={field.key}
      value={value}
      placeholder={field.placeholder}
      onFocus={onFocus}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    />
  )
}

// The Editor tab: one input per field on the selected node, or an empty state.
function Inspector({ node }: { node: StepNodeType | undefined }) {
  const { updateNodeData } = useReactFlow<StepNodeType>()
  // Outputs of every node upstream of the selected one, as insertable {{ }}
  // tokens. Empty when nothing feeds into this node.
  const connections = useUpstreamConnections()
  // The step this node produced in the most recent run, for the footer card.
  const { steps } = useLatestRunSteps()
  // The field a clicked chip inserts into — whichever was focused most recently.
  // Reset per selected node since this component is keyed by node id.
  const [activeFieldKey, setActiveFieldKey] = useState<string | null>(null)

  if (!node) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 text-center text-[13px] text-[#5A6273]">
        Select a node on the canvas to edit it.
      </div>
    )
  }

  const { type, title, values } = node.data
  const def: NodeDefinition = nodeRegistry[type]
  const lastRun = steps.find((s) => s.nodeId === node.id)

  // Untouched fields fall back to the first one, so a chip always has a home.
  const targetKey = activeFieldKey ?? def.fields[0]?.key

  const insertToken = (token: string) => {
    if (!targetKey) return
    updateNodeData(node.id, {
      values: { ...values, [targetKey]: (values[targetKey] ?? "") + token },
    })
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex items-center gap-[11px] border-b border-white/[0.06] px-4 py-3.5">
        <NodeIcon type={type} className="size-7 rounded-[9px]" />
        <span className="truncate text-[15px] font-semibold tracking-[-0.015em]">
          {title}
        </span>
        <span className="flex-1" />
        <span className="rounded-[5px] border border-white/[0.08] px-[7px] py-[3px] font-mono text-[9px] tracking-[0.12em] text-[#5A6273] uppercase">
          {def.kind}
        </span>
      </div>

      <div className="flex flex-col gap-4 p-4">
        {def.fields.length === 0 ? (
          <p className="text-xs text-[#5A6273]">No properties</p>
        ) : (
          def.fields.map((field) => (
            <div key={field.key}>
              <div className="mb-[7px] flex items-center gap-1.5">
                <label
                  htmlFor={field.key}
                  className="text-xs font-semibold text-[#B7BEC9]"
                >
                  {field.label}
                </label>
                {field.required && (
                  <span className="text-xs text-[#FF4D6A]">*</span>
                )}
                <span className="flex-1" />
                <span className="font-mono text-[9px] text-[#4E5666]">
                  {field.multiline ? "TEXT" : "STRING"}
                </span>
              </div>
              <Field
                field={field}
                value={values[field.key] ?? ""}
                onFocus={() => setActiveFieldKey(field.key)}
                onChange={(value) => {
                  updateNodeData(node.id, {
                    values: { ...values, [field.key]: value },
                  })
                }}
              />
            </div>
          ))
        )}

        {/* Available upstream outputs — click to drop a token into the last
            focused field (or the first field if none has been touched). */}
        {connections.length > 0 && (
          <>
            <div className="h-px bg-white/[0.06]" />
            <div>
              <SectionLabel>CONNECTIONS</SectionLabel>
              <div className="flex flex-wrap gap-1.5">
                {connections.map((connection) => (
                  <button
                    key={connection.token}
                    type="button"
                    onClick={() => insertToken(connection.token)}
                    className="flex max-w-full items-center gap-[7px] rounded-[9px] border border-white/[0.08] bg-white/[0.035] px-2.5 py-1.5 transition-colors hover:border-[rgba(91,140,255,0.4)]"
                  >
                    <NodeIcon
                      type={connection.nodeType}
                      className="size-3.5 rounded-[4px]"
                    />
                    <span className="truncate font-mono text-[11px] text-[#C9CFDB]">
                      {connection.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* What this node did in the most recent run — the design's accent card
            at the bottom of the editor. */}
        {lastRun && (
          <div className="rounded-xl border border-[rgba(91,140,255,0.16)] bg-[linear-gradient(150deg,rgba(91,140,255,0.1),rgba(255,255,255,0.02))] px-[13px] py-3">
            <div className="mb-1.5 flex items-center gap-[7px]">
              <span className="size-[5px] animate-pulse rounded-full bg-[#5B8CFF] shadow-[0_0_8px_#5B8CFF]" />
              <span className="text-[11.5px] font-semibold tracking-[0.02em] text-[#C9D6FF]">
                Last run
              </span>
              <span className="flex-1" />
              <span className="font-mono text-[10px] text-[#8CA8FF] uppercase">
                {lastRun.status}
              </span>
            </div>
            <p className="text-[11.5px] leading-[1.5] break-words text-[#8E96A6]">
              {lastRun.error ??
                (lastRun.output !== undefined
                  ? JSON.stringify(lastRun.output)
                  : "No output recorded for this step.")}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Toolbar tab — adds nodes to the canvas, grouped by kind.
// ---------------------------------------------------------------------------

// The Toolbar's groups, one section per node kind.
const sections: { kind: StepNodeKind; label: string }[] = [
  { kind: "trigger", label: "TRIGGERS" },
  { kind: "action", label: "ACTIONS" },
]

// Every node type from the registry, filtered into the groups below.
const definitions = Object.values(nodeRegistry)

// Node types that only orgs on the Pro plan can add. The Agent node is our most
// expensive node, so it's gated; every other node stays free to keep workflow
// building open to everyone.
const premiumNodes = new Set<NodeType>(["agent"])

// The Toolbar tab: a button per node type that adds it to the canvas.
function Palette() {
  // The shared React Flow store (lifted to a provider above the canvas and this
  // sidebar) lets us read the current nodes/viewport and add to them from here.
  const { getNodes, getViewport, addNodes } = useReactFlow<StepNodeType>()
  // The pane's measured size, used to find the center of the current view.
  const width = useStore((s) => s.width)
  const height = useStore((s) => s.height)
  // Whether the active org is on Pro, plus a way to send them to upgrade.
  const { isLoaded, isPro, goToUpgrade } = useProPlan()

  // A premium node is locked until the plan check has loaded and confirms Pro.
  // We wait for `isLoaded` so a Pro org never flashes a locked state on mount.
  const isLocked = (type: NodeType) =>
    premiumNodes.has(type) && isLoaded && !isPro

  const add = (type: NodeType) => {
    // Premium nodes route to upgrade instead of being added for non-pro orgs.
    if (isLocked(type)) {
      goToUpgrade()
      return
    }

    const def = nodeRegistry[type]
    const nodes = getNodes()

    // Only one trigger is allowed — a workflow has a single entry point.
    if (def.kind === "trigger" && nodes.some((n) => n.data.kind === "trigger")) {
      toast.error("A workflow can only have one trigger.")
      return
    }

    // Number nodes of the same type (e.g. "Open URL 1", "Open URL 2") so
    // duplicates stay easy to tell apart.
    const count = nodes.filter((n) => n.data.type === type).length
    const title = `${def.label} ${count + 1}`

    // Drop the node in the middle of the current view. The viewport transform
    // maps a flow point p to the screen as p * zoom + {x, y}, so the pane center
    // in flow coordinates is (center - offset) / zoom.
    const { x, y, zoom } = getViewport()
    const position = {
      x: (width / 2 - x) / zoom,
      y: (height / 2 - y) / zoom,
    }

    addNodes({
      id: crypto.randomUUID(),
      type: "step",
      position,
      data: { type, kind: def.kind, title, values: {} },
    })
  }

  return (
    <div className="flex-1 overflow-y-auto px-3.5 py-4">
      {sections.map((section) => (
        <div key={section.kind} className="mb-5 last:mb-0">
          <SectionLabel>{section.label}</SectionLabel>
          <div className="flex flex-col gap-1.5">
            {definitions
              .filter((def) => def.kind === section.kind)
              .map((def) => {
                const type = def.type as NodeType
                const locked = isLocked(type)
                return (
                  <button
                    key={def.type}
                    type="button"
                    onClick={() => add(type)}
                    title={
                      locked ? "Upgrade to Pro to add this node" : undefined
                    }
                    className="flex items-center gap-[11px] rounded-[11px] border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 transition-colors hover:border-[rgba(91,140,255,0.3)] hover:bg-[rgba(91,140,255,0.09)]"
                  >
                    <NodeIcon
                      type={type}
                      className="size-[26px] rounded-[8px]"
                    />
                    <span className="text-[13.5px] font-medium">
                      {def.label}
                    </span>
                    <span className="flex-1" />
                    {locked ? (
                      <Lock className="size-3.5 text-[#4E5666]" />
                    ) : (
                      <span className="font-mono text-[9px] text-[#4E5666]">
                        {def.tag}
                      </span>
                    )}
                  </button>
                )
              })}
          </div>
        </div>
      ))}

      <div className="mt-5 rounded-xl border border-dashed border-white/[0.12] bg-white/[0.025] p-3 text-center">
        <p className="text-xs leading-[1.5] text-[#7C8494]">
          Click a block to drop it on the canvas, then drag from a node&apos;s
          bottom tab to connect it.
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Header — workflow-level actions shown above the tabs.
// ---------------------------------------------------------------------------

// The "..." menu for workflow-level actions.
function ActionsMenu({ workflowId }: { workflowId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="grid size-8 place-items-center rounded-[9px] border border-white/[0.07] text-[#9AA2B1] transition-colors hover:bg-white/[0.05] hover:text-white"
        >
          <MoreHorizontal className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-48">
        <DropdownMenuItem
          variant="destructive"
          disabled={isPending}
          className="text-xs"
          onSelect={(e) => {
            // Keep the menu mounted while the delete runs so the disabled state
            // stays visible. Running inside a transition lets the router handle
            // the action's redirect home on success.
            e.preventDefault()
            startTransition(async () => {
              await deleteWorkflowAction(workflowId)
            })
          }}
        >
          <Trash2 />
          Delete workflow
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Toggles between running the current workflow and stopping the run in flight.
// While a run is live it becomes a Stop button that cancels that run; otherwise
// it validates the graph and kicks off a new run.
function RunButton({ workflowId }: { workflowId: string }) {
  const { getNodes, getEdges } = useReactFlow<StepNodeType>()
  const [isPending, startTransition] = useTransition()
  // The run in flight, if any. At most one is live at a time, so its presence
  // decides which mode the button is in.
  const liveRun = useLiveRun()

  const base =
    "relative flex items-center gap-2 overflow-hidden rounded-[11px] px-[18px] py-[9px] text-[13.5px] font-semibold text-white transition-opacity disabled:opacity-60"

  if (liveRun) {
    return (
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            try {
              await cancelWorkflowRunAction(liveRun.id)
            } catch {
              toast.error("Couldn't stop the run.")
            }
          })
        }}
        className={cn(
          base,
          "bg-[linear-gradient(160deg,#FF6B85,#E11D48)] shadow-[0_12px_26px_-12px_rgba(225,29,72,0.95),inset_0_1px_0_rgba(255,255,255,0.35)]"
        )}
      >
        <Square className="size-3.5" fill="currentColor" />
        Stop
      </button>
    )
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        const graph = { nodes: getNodes(), edges: getEdges() }
        const problems = validateGraph(graph)
        if (problems.length > 0) {
          toast.error(problems[0])
          return
        }

        startTransition(async () => {
          try {
            await runWorkflowAction({ id: workflowId, graph })
          } catch (error) {
            toast.error(
              error instanceof Error ? error.message : "Couldn't start the run."
            )
          }
        })
      }}
      className={cn(
        base,
        "bg-[linear-gradient(160deg,#7CA0FF,#3D63F5)] shadow-[0_12px_26px_-12px_rgba(61,99,245,0.95),inset_0_1px_0_rgba(255,255,255,0.35)]"
      )}
    >
      <Play className="size-3.5" fill="currentColor" />
      Run
      {/* The design's light sweep across the primary action. */}
      <span className="pointer-events-none absolute inset-y-0 left-0 w-[40%] animate-[sheen_3.4s_ease-in-out_infinite] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)]" />
    </button>
  )
}

// ---------------------------------------------------------------------------
// The sidebar itself — header on top, then the Toolbar / Editor tabs.
// ---------------------------------------------------------------------------

export function RightSidebar({ workflowId }: { workflowId: string }) {
  const [tab, setTab] = useState<"toolbar" | "editor">("toolbar")
  const liveRun = useLiveRun()

  const selected = useStore((s) => s.nodes.find((n) => n.selected)) as
    | StepNodeType
    | undefined

  // Follow the canvas: selecting a node swings the panel over to its editor.
  const [prevSelectedId, setPrevSelectedId] = useState(selected?.id)
  if (selected && selected.id !== prevSelectedId) {
    setPrevSelectedId(selected.id)
    setTab("editor")
  }

  const tabClass = (active: boolean) =>
    cn(
      "flex-1 rounded-[9px] border py-2 text-center text-[13px] font-semibold transition-colors",
      active
        ? "border-[rgba(91,140,255,0.28)] bg-[rgba(91,140,255,0.14)] text-[#EEF1F6]"
        : "border-transparent text-[#7C8494] hover:text-[#EEF1F6]"
    )

  return (
    <div className="flex size-full flex-col border-l border-white/[0.06] bg-[linear-gradient(180deg,#0B0D11,#08090C)]">
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-white/[0.06] px-3.5">
        <ActionsMenu workflowId={workflowId} />
        <span className="font-mono text-[10px] tracking-[0.14em] text-[#4E5666]">
          {liveRun ? "RUNNING" : "SYNCED"}
        </span>
        <span className="flex-1" />
        <RunButton workflowId={workflowId} />
      </div>

      <div className="flex shrink-0 gap-1 border-b border-white/[0.06] px-3.5 py-3">
        <button
          type="button"
          onClick={() => setTab("toolbar")}
          className={tabClass(tab === "toolbar")}
        >
          Toolbar
        </button>
        <button
          type="button"
          onClick={() => setTab("editor")}
          className={tabClass(tab === "editor")}
        >
          Editor
        </button>
      </div>

      {tab === "toolbar" ? (
        <Palette />
      ) : (
        <Inspector key={selected?.id} node={selected} />
      )}

      <div className="flex shrink-0 items-center gap-2 border-t border-white/[0.06] px-4 py-3">
        <span
          className={cn(
            "size-1.5 rounded-full",
            liveRun
              ? "bg-[#5B8CFF] shadow-[0_0_8px_#5B8CFF]"
              : "bg-[#10E5A0] shadow-[0_0_8px_#10E5A0]"
          )}
        />
        <span className="font-mono text-[10px] tracking-[0.1em] text-[#5A6273]">
          {liveRun ? "BROWSER SESSION ACTIVE" : "NO ACTIVE SESSION"}
        </span>
      </div>
    </div>
  )
}
