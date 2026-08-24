"use client"

import { RotateCw, TriangleAlert } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="grid size-full place-items-center bg-[#0A0B0F]">
      <div className="max-w-[340px] px-6 text-center">
        <div className="mx-auto mb-5 grid size-16 place-items-center rounded-[18px] border border-[rgba(255,77,106,0.24)] bg-[linear-gradient(160deg,rgba(255,77,106,0.16),rgba(255,255,255,0.03))]">
          <TriangleAlert className="size-[26px] text-[#FF8FA3]" strokeWidth={1.7} />
        </div>
        <h1 className="mb-2 text-[19px] font-semibold tracking-[-0.02em]">
          Something went wrong
        </h1>
        <p className="mb-[22px] text-[13.5px] leading-[1.6] text-[#7C8494]">
          {error.message || "We couldn't load this workflow. Please try again."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-[11px] bg-[linear-gradient(160deg,#F4F6FA,#D8DEEA)] px-[18px] py-2.5 text-[13.5px] font-semibold text-[#0A0B0F]"
        >
          <RotateCw className="size-[15px]" strokeWidth={2.4} />
          Try again
        </button>
      </div>
    </div>
  )
}
