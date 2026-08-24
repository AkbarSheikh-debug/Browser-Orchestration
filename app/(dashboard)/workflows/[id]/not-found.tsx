import Link from "next/link"
import { SearchX } from "lucide-react"

export default function NotFound() {
  return (
    <div className="grid size-full place-items-center bg-[#0A0B0F]">
      <div className="max-w-[340px] px-6 text-center">
        <div className="mx-auto mb-5 grid size-16 place-items-center rounded-[18px] border border-white/[0.08] bg-white/[0.03]">
          <SearchX className="size-[26px] text-[#7C8494]" strokeWidth={1.7} />
        </div>
        <h1 className="mb-2 text-[19px] font-semibold tracking-[-0.02em]">
          Workflow not found
        </h1>
        <p className="mb-[22px] text-[13.5px] leading-[1.6] text-[#7C8494]">
          The workflow you&apos;re looking for doesn&apos;t exist or may have
          been deleted.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-[11px] bg-[linear-gradient(160deg,#F4F6FA,#D8DEEA)] px-[18px] py-2.5 text-[13.5px] font-semibold text-[#0A0B0F]"
        >
          Back to workflows
        </Link>
      </div>
    </div>
  )
}
