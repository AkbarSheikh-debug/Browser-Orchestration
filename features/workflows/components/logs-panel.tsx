"use client"

import prettyMilliseconds from "pretty-ms"
import { Lock, MonitorPlay } from "lucide-react"

import { cn } from "@/lib/utils"

import { NodeIcon } from "@/features/workflows/components/node-icon"
import { useProPlan } from "@/features/workflows/hooks/use-pro-plan"
import {
  useConsoleRuns,
  type ConsoleRun,
} from "@/features/workflows/components/workflow-runs-provider"
import type { RunStep } from "@/features/workflows/tasks/run-workflow"

// A step is identified across the whole console by which run it belongs to and
// which node it is — the same node id recurs across runs, so both are needed.
export interface StepSelection {
  kind: "step"
  runId: string
  nodeId: string
}

// The replay of a whole run, not a single step — identified by its run alone.
export interface ReplaySelection {
  kind: "replay"
  runId: string
}

// What the console can have selected: one step's output, or one run's replay.
// Only one is active at a time.
export type ConsoleSelection = StepSelection | ReplaySelection

const ROW_CLASS =
  "flex w-full items-center gap-[11px] rounded-[9px] px-2.5 py-2 text-left transition-colors hover:bg-white/[0.04]"

// One step row: the node's gradient chip, its title, and how long it took. It
// spins while running, reads red when it failed, and dims when it never ran.
function StepRow({
  run,
  step,
  isSelected,
  onSelect,
}: {
  run: ConsoleRun
  step: RunStep
  isSelected: boolean
  onSelect: (selection: StepSelection) => void
}) {
  // Only spin while the run is actually live — a step left "running" by a run
  // that has since ended should stop rather than hang forever.
  const isRunning = step.status === "running" && run.isLive
  const isFailed = step.status === "failed"
  const isInactive = step.status === "pending"

  return (
    <button
      type="button"
      onClick={() =>
        onSelect({ kind: "step", runId: run.id, nodeId: step.nodeId })
      }
      className={cn(
        ROW_CLASS,
        isSelected && "bg-[rgba(91,140,255,0.12)]",
        isInactive && "opacity-50"
      )}
    >
      <NodeIcon type={step.type} running={isRunning} className="size-[22px]" />
      <span
        className={cn(
          "truncate text-[13px] font-medium",
          isFailed && "text-[#FF4D6A]"
        )}
      >
        {step.title}
      </span>
      <span className="flex-1" />
      {step.durationMs != null && (
        <span className="shrink-0 font-mono text-[11px] text-[#6E7684] tabular-nums">
          {prettyMilliseconds(step.durationMs)}
        </span>
      )}
    </button>
  )
}

// The replay row for a finished run: it sits with the step rows and selects the
// same way, but it stands for the whole run's recording rather than one step.
function ReplayRow({
  run,
  isSelected,
  onSelect,
}: {
  run: ConsoleRun
  isSelected: boolean
  onSelect: (selection: ReplaySelection) => void
}) {
  // Watching a recording is a Pro feature. Wait for `isLoaded` so a Pro org
  // never flashes a locked state on mount.
  const { isLoaded, isPro, goToUpgrade } = useProPlan()
  const isLocked = isLoaded && !isPro

  return (
    <button
      type="button"
      // Locked rows send the user to upgrade instead of opening the recording.
      onClick={() =>
        isLocked ? goToUpgrade() : onSelect({ kind: "replay", runId: run.id })
      }
      title={isLocked ? "Upgrade to Pro to watch replays" : undefined}
      className={cn(ROW_CLASS, isSelected && "bg-[rgba(91,140,255,0.12)]")}
    >
      <span className="grid size-[22px] shrink-0 place-items-center rounded-[7px] border border-white/[0.08] bg-white/[0.05] text-[#9AA2B1]">
        <MonitorPlay className="size-3" />
      </span>
      <span className="truncate text-[13px] font-medium">Replay</span>
      <span className="flex-1" />
      {isLocked && <Lock className="size-3.5 shrink-0 text-[#6E7684]" />}
    </button>
  )
}

// The list of runs, newest first, each with its steps below it. Reads the shared
// realtime run history and reports clicks up to the ConsolePanel, which owns the
// selection.
export function LogsPanel({
  selected,
  onSelect,
}: {
  selected: ConsoleSelection | null
  onSelect: (selection: ConsoleSelection) => void
}) {
  const runs = useConsoleRuns()
  const latest = runs[0]

  return (
    <div className="flex size-full flex-col">
      <div className="flex items-center gap-2.5 px-4 pt-3 pb-2">
        <span className="font-mono text-[10px] tracking-[0.18em] text-[#61697A]">
          LOGS
        </span>
        <span className="flex-1" />
        {latest && (
          <span className="font-mono text-[10px] text-[#4E5666]">
            {latest.createdAt.toLocaleTimeString()} ·{" "}
            {latest.status.toLowerCase()}
          </span>
        )}
      </div>

      {runs.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-[13px] text-[#5A6273]">
          No runs yet
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-2 pb-2.5">
          {runs.map((run) => (
            <div key={run.id} className="flex flex-col gap-px">
              {/* Only later runs need their own header — the newest one is
                  already labelled by the panel header above. */}
              {run.id !== latest?.id && (
                <div className="flex items-center gap-2 px-2.5 py-1 font-mono text-[10px] text-[#4E5666]">
                  <span>{run.createdAt.toLocaleTimeString()}</span>
                  <span className="lowercase">{run.status}</span>
                </div>
              )}
              {run.steps.map((step) => (
                <StepRow
                  key={step.nodeId}
                  run={run}
                  step={step}
                  isSelected={
                    selected?.kind === "step" &&
                    selected.runId === run.id &&
                    selected.nodeId === step.nodeId
                  }
                  onSelect={onSelect}
                />
              ))}
              {/* A recording only exists once the run has finished — its session
                  id is present and it's no longer live. */}
              {run.browserbaseSessionId && !run.isLive && (
                <ReplayRow
                  run={run}
                  isSelected={
                    selected?.kind === "replay" && selected.runId === run.id
                  }
                  onSelect={onSelect}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
