"use client"

import { useState } from "react"

import { SessionReplay } from "@/features/workflows/components/session-replay"
import { useConsoleRuns } from "@/features/workflows/components/workflow-runs-provider"
import type { ConsoleSelection } from "@/features/workflows/components/logs-panel"

// A short, centered note for when there's nothing concrete to show.
function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex size-full items-center justify-center p-3 text-center text-xs text-[#5A6273]">
      {children}
    </div>
  )
}

// The design's OUTPUT header: the mono label, a tag for what's being shown, and
// a copy affordance on the right.
function OutputHeader({ tag, payload }: { tag: string; payload?: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <div className="flex items-center gap-2.5 px-4 pt-3 pb-2">
      <span className="font-mono text-[10px] tracking-[0.18em] text-[#61697A]">
        OUTPUT
      </span>
      <span className="max-w-[40%] truncate rounded-[5px] bg-white/[0.05] px-[7px] py-0.5 font-mono text-[9.5px] text-[#8E96A6]">
        {tag}
      </span>
      <span className="flex-1" />
      {payload && (
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(payload).then(() => {
              setCopied(true)
              setTimeout(() => setCopied(false), 1500)
            })
          }}
          className="font-mono text-[10px] text-[#4E5666] transition-colors hover:text-white"
        >
          {copied ? "COPIED" : "COPY"}
        </button>
      )}
    </div>
  )
}

// The scrolling code slab the design frames the payload in.
function OutputBody({
  children,
  tone = "output",
}: {
  children: React.ReactNode
  tone?: "output" | "error"
}) {
  return (
    <div className="mx-3.5 mt-0.5 mb-3.5 flex-1 overflow-auto rounded-xl border border-white/[0.06] bg-white/[0.028] px-4 py-3.5">
      <pre
        className={`m-0 font-mono text-xs leading-[1.75] break-words whitespace-pre-wrap ${
          tone === "error" ? "text-[#FF8FA3]" : "text-[#A7E9CE]"
        }`}
      >
        {children}
      </pre>
    </div>
  )
}

// The output pane for whatever the logs have selected: a step's output, or a
// whole run's session replay. It re-reads the shared run history so a
// still-running step's output appears the moment it lands, without a re-select.
export function InspectorPanel({ selection }: { selection: ConsoleSelection }) {
  const runs = useConsoleRuns()
  const run = runs.find((r) => r.id === selection.runId)

  // A run's replay stands for the whole session — play it instead of any step.
  if (selection.kind === "replay") {
    if (!run?.browserbaseSessionId) {
      return (
        <div className="flex size-full flex-col">
          <OutputHeader tag="replay" />
          <Note>This recording is no longer available.</Note>
        </div>
      )
    }
    return (
      <div className="flex size-full flex-col">
        <OutputHeader tag="replay" />
        <div className="mx-3.5 mt-0.5 mb-3.5 flex-1 overflow-hidden rounded-xl border border-white/[0.06]">
          <SessionReplay sessionId={run.browserbaseSessionId} />
        </div>
      </div>
    )
  }

  const step = run?.steps.find((s) => s.nodeId === selection.nodeId)

  // The selected step can vanish if its run drops out of the realtime window.
  if (!step) {
    return (
      <div className="flex size-full flex-col">
        <OutputHeader tag="step" />
        <Note>This step is no longer available.</Note>
      </div>
    )
  }

  const json =
    step.output !== undefined ? JSON.stringify(step.output, null, 2) : undefined

  return (
    <div className="flex size-full flex-col">
      <OutputHeader tag={step.title} payload={step.error ?? json} />
      {step.error ? (
        <OutputBody tone="error">{step.error}</OutputBody>
      ) : json !== undefined ? (
        <OutputBody>{json}</OutputBody>
      ) : step.status === "pending" ? (
        <Note>This step hasn&apos;t run yet.</Note>
      ) : step.status === "running" ? (
        <Note>Waiting for this step to finish…</Note>
      ) : (
        <Note>This step produced no output.</Note>
      )}
    </div>
  )
}
