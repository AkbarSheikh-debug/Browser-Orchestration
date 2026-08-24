import { Workflow } from "lucide-react"

import { NewWorkflowButton } from "@/features/workflows/components/new-workflow-button"

export default function Page() {
  return (
    <div className="grid size-full place-items-center bg-[#0A0B0F]">
      <div className="max-w-[340px] px-6 text-center">
        <div className="mx-auto mb-5 grid size-16 place-items-center rounded-[18px] border border-[rgba(91,140,255,0.24)] bg-[linear-gradient(160deg,rgba(91,140,255,0.18),rgba(255,255,255,0.03))] shadow-[0_0_40px_-10px_rgba(91,140,255,0.6)]">
          <Workflow className="size-[26px] text-[#C9D6FF]" strokeWidth={1.7} />
        </div>
        <h1 className="mb-2 text-[19px] font-semibold tracking-[-0.02em]">
          No workflow selected
        </h1>
        <p className="mb-[22px] text-[13.5px] leading-[1.6] text-pretty text-[#7C8494]">
          Pick a workflow from the sidebar, or spin up a new browser agent from
          scratch.
        </p>
        <NewWorkflowButton />
      </div>
    </div>
  )
}
