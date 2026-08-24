import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

import { Canvas } from "./canvas"
import { ConsolePanel } from "./console-panel"
import { RightSidebar } from "./right-sidebar"
import { WorkflowTopbar } from "./workflow-topbar"

interface WorkflowShellProps {
  workflowId: string
  workflowName: string
}

// The workflow editor's three-part frame, matching the design: the canvas with
// its run console stacked beneath it, and the toolbar/editor panel alongside.
export function WorkflowShell({ workflowId, workflowName }: WorkflowShellProps) {
  return (
    <ResizablePanelGroup orientation="horizontal" className="size-full">
      <ResizablePanel minSize="30rem">
        <div className="flex size-full flex-col bg-[#0A0B0F]">
          <WorkflowTopbar name={workflowName} />
          <ResizablePanelGroup orientation="vertical" className="min-h-0 flex-1">
            <ResizablePanel minSize="18rem">
              <Canvas />
            </ResizablePanel>
            <ResizableHandle className="bg-white/[0.07]" />
            <ResizablePanel defaultSize="15.75rem" minSize="8rem">
              <ConsolePanel />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </ResizablePanel>
      <ResizableHandle className="bg-white/[0.06]" />
      <ResizablePanel defaultSize="23.25rem" minSize="18rem" maxSize="36rem">
        <RightSidebar workflowId={workflowId} />
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
