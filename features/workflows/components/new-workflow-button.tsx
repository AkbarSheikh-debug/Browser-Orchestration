"use client"

import { useTransition } from "react"
import { PlusIcon } from "lucide-react"

import { createWorkflowAction } from "@/features/workflows/actions"
import { generateSlug } from "@/features/workflows/lib/generate-slug"

// The design's primary light-on-dark button, used by the empty state.
export function NewWorkflowButton() {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await createWorkflowAction(generateSlug())
        })
      }}
      className="inline-flex items-center gap-2 rounded-[11px] bg-[linear-gradient(160deg,#F4F6FA,#D8DEEA)] px-[18px] py-2.5 text-[13.5px] font-semibold text-[#0A0B0F] shadow-[0_14px_30px_-14px_rgba(255,255,255,0.5)] transition-opacity disabled:opacity-60"
    >
      <PlusIcon className="size-[15px]" strokeWidth={2.4} />
      New workflow
    </button>
  )
}
