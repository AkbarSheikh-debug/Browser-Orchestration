import { AppSidebar } from "@/components/app-sidebar"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex h-svh overflow-hidden bg-[#07080B] text-[#EEF1F6]">
      <AppSidebar />
      <main className="min-w-0 flex-1 overflow-hidden">{children}</main>
    </div>
  )
}
