import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="grid size-full place-items-center bg-[#0A0B0F]">
      <Loader2 className="size-6 animate-spin text-[#5A6273]" />
    </div>
  )
}
