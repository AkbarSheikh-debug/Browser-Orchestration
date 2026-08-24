"use client"

import { useState } from "react"

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

import { InspectorPanel } from "@/features/workflows/components/inspector-panel"
import {
  LogsPanel,
  type ConsoleSelection,
} from "@/features/workflows/components/logs-panel"

// True when two selections point at the same thing — same kind, same run, and
// for a step the same node. Clicking the active selection again clears it.
function isSameSelection(a: ConsoleSelection, b: ConsoleSelection) {
  if (a.kind !== b.kind) return false
  if (a.runId !== b.runId) return false
  return a.kind === "step" && b.kind === "step" ? a.nodeId === b.nodeId : true
}

// The run console below the canvas. It owns what's selected: the logs on the
// left drive the selection, and the InspectorPanel on the right shows either the
// selected step's output or the selected run's replay. Clicking the active
// selection again clears it.
export function ConsolePanel() {
  const [selected, setSelected] = useState<ConsoleSelection | null>(null)

  const toggle = (selection: ConsoleSelection) => {
    setSelected((prev) =>
      prev && isSameSelection(prev, selection) ? null : selection
    )
  }

  return (
    <div className="size-full border-t border-white/[0.07] bg-[linear-gradient(180deg,#0B0D11,#08090C)]">
      <ResizablePanelGroup orientation="horizontal" className="size-full">
        <ResizablePanel defaultSize="46%" minSize="17.5rem">
          <LogsPanel selected={selected} onSelect={toggle} />
        </ResizablePanel>
        {selected && (
          <>
            <ResizableHandle className="bg-white/[0.06]" />
            <ResizablePanel defaultSize="20rem" minSize="12rem">
              <InspectorPanel selection={selected} />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  )
}
