"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs"
import {
  PanelLeft,
  PlusIcon,
  Settings,
  SlidersHorizontal,
  Workflow as WorkflowIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { generateSlug } from "@/features/workflows/lib/generate-slug"
import { useProPlan } from "@/features/workflows/hooks/use-pro-plan"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import type { Workflow } from "@/lib/db/schema"

interface WorkflowNavProps {
  workflows: Workflow[]
  onCreateWorkflow: (name: string) => Promise<void>
  // False when DATABASE_URL is unset. The list can't be loaded or added to, so
  // the panel shows setup guidance instead of an empty state.
  isDatabaseConfigured: boolean
}

// A rail button — the narrow icon strip down the far left of the design.
function RailButton({
  active,
  onClick,
  href,
  label,
  showTooltip = true,
  children,
}: {
  active?: boolean
  onClick?: () => void
  href?: string
  label: string
  showTooltip?: boolean
  children: React.ReactNode
}) {
  const className = cn(
    "grid size-[34px] place-items-center rounded-[10px] border transition-colors",
    active
      ? "border-[rgba(91,140,255,0.28)] bg-[rgba(91,140,255,0.14)] text-[#EEF1F6] shadow-[0_0_18px_-4px_rgba(91,140,255,0.45)]"
      : "border-transparent text-[#6E7684] hover:bg-white/[0.05] hover:text-white"
  )
  const title = showTooltip ? label : undefined

  if (href) {
    return (
      <Link href={href} aria-label={label} title={title} className={className}>
        {children}
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={title}
      className={className}
    >
      {children}
    </button>
  )
}

// The workflow rows shared by the expanded panel list and the collapsed popover.
function WorkflowListItems({
  workflows,
  pathname,
  isDatabaseConfigured,
}: {
  workflows: Workflow[]
  pathname: string
  isDatabaseConfigured: boolean
}) {
  if (!isDatabaseConfigured) {
    return (
      <div className="mx-[3px] rounded-[10px] border border-dashed border-white/[0.12] bg-white/[0.02] px-3 py-2.5">
        <p className="mb-1 text-xs font-semibold text-[#B7BEC9]">
          Database not connected
        </p>
        <p className="text-[11px] leading-[1.55] text-[#7C8494]">
          Add{" "}
          <span className="font-mono text-[10px] text-[#8CA8FF]">
            DATABASE_URL
          </span>{" "}
          to .env.local, then run{" "}
          <span className="font-mono text-[10px] text-[#8CA8FF]">
            npm run db:migrate
          </span>
          .
        </p>
      </div>
    )
  }

  if (workflows.length === 0) {
    return (
      <p className="px-[11px] py-2 text-xs leading-relaxed text-[#5A6273]">
        No workflows yet. Create one to get started.
      </p>
    )
  }

  return (
    <>
      {workflows.map((workflow) => {
        const isActive = pathname === `/workflows/${workflow.id}`
        return (
          <Link
            key={workflow.id}
            href={`/workflows/${workflow.id}`}
            className={cn(
              "flex items-center rounded-[10px] border px-[11px] py-[9px] transition-colors",
              isActive
                ? "border-[rgba(91,140,255,0.22)] bg-[rgba(91,140,255,0.12)] text-[#EEF1F6] shadow-[0_0_18px_-8px_rgba(91,140,255,0.6)]"
                : "border-transparent text-[#98A0AE] hover:bg-white/[0.035] hover:text-[#EEF1F6]"
            )}
          >
            <span className="truncate text-[13.5px] font-medium tracking-[-0.01em]">
              {workflow.name}
            </span>
          </Link>
        )
      })}
    </>
  )
}

// The rail's workflow icon: a plain nav link while the panel is expanded
// (the panel already shows the list), or a popover trigger for the list
// once the panel is collapsed and the list has nowhere else to render.
function WorkflowsRailControl({
  open,
  pathname,
  workflows,
  isDatabaseConfigured,
  isPending,
  onCreateWorkflow,
}: {
  open: boolean
  pathname: string
  workflows: Workflow[]
  isDatabaseConfigured: boolean
  isPending: boolean
  onCreateWorkflow: () => void
}) {
  if (open) {
    return (
      <RailButton
        label="Workflows"
        href="/"
        active={pathname === "/"}
        showTooltip={false}
      >
        <WorkflowIcon className="size-[17px]" />
      </RailButton>
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <RailButton
          label="Workflows"
          active={pathname === "/"}
          showTooltip={false}
        >
          <WorkflowIcon className="size-[17px]" />
        </RailButton>
      </PopoverTrigger>
      <PopoverContent side="right" align="start" className="w-64">
        <button
          type="button"
          onClick={onCreateWorkflow}
          disabled={isPending || !isDatabaseConfigured}
          className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm font-medium text-[#EEF1F6] transition-colors hover:bg-white/[0.05] disabled:opacity-50"
        >
          <PlusIcon className="size-4" strokeWidth={2} />
          New workflow
        </button>
        <Separator className="my-1" />
        <div className="flex max-h-80 flex-col gap-0.5 overflow-y-auto">
          <WorkflowListItems
            workflows={workflows}
            pathname={pathname}
            isDatabaseConfigured={isDatabaseConfigured}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

// The whole left sidebar: a fixed icon rail, plus a collapsible panel listing
// this organization's workflows.
export function WorkflowNav({
  workflows,
  onCreateWorkflow,
  isDatabaseConfigured,
}: WorkflowNavProps) {
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(true)
  const { isPro } = useProPlan()

  const handleCreateWorkflow = () => {
    startTransition(async () => {
      await onCreateWorkflow(generateSlug())
    })
  }

  return (
    <div className="flex h-full shrink-0 border-r border-white/[0.06] bg-[linear-gradient(180deg,#0B0D11,#08090C)]">
      {/* Icon rail */}
      <div className="flex h-full w-16 flex-col items-center gap-3.5 border-r border-white/[0.05] py-4">
        <div className="grid size-[34px] place-items-center rounded-[11px] bg-[linear-gradient(150deg,#7C5CFF,#4B7BFF)] shadow-[0_8px_22px_-6px_rgba(91,140,255,0.75),inset_0_1px_0_rgba(255,255,255,0.35)]">
          <SlidersHorizontal
            className="size-[17px] text-white"
            strokeWidth={2.2}
          />
        </div>

        <RailButton
          label={open ? "Hide workflows" : "Show workflows"}
          onClick={() => setOpen((value) => !value)}
        >
          <PanelLeft className="size-[17px]" />
        </RailButton>

        <WorkflowsRailControl
          open={open}
          pathname={pathname}
          workflows={workflows}
          isDatabaseConfigured={isDatabaseConfigured}
          isPending={isPending}
          onCreateWorkflow={handleCreateWorkflow}
        />

        <RailButton
          label="Billing"
          href="/billing"
          active={pathname === "/billing"}
        >
          <Settings className="size-[17px]" />
        </RailButton>

        <span className="flex-1" />

        <UserButton
          appearance={{ elements: { userButtonTrigger: "rounded-full" } }}
        />
      </div>

      {/* Workflow panel — slides away when the rail toggle collapses it. */}
      <div
        className={cn(
          "flex h-full flex-col overflow-hidden transition-[width,opacity] duration-300 ease-out",
          open ? "w-[244px] opacity-100" : "w-0 opacity-0"
        )}
      >
        <div className="flex items-center gap-2 px-[18px] pt-[18px] pb-3.5">
          <div className="min-w-0 flex-1">
            <OrganizationSwitcher
              hidePersonal
              afterCreateOrganizationUrl="/"
              afterSelectOrganizationUrl="/"
              afterLeaveOrganizationUrl="/"
              appearance={{
                elements: {
                  rootBox: "w-full min-w-0",
                  organizationSwitcherTrigger: "w-full justify-between",
                },
              }}
            />
          </div>
          {isPro && (
            <span className="shrink-0 rounded-[5px] border border-[rgba(91,140,255,0.22)] bg-[rgba(91,140,255,0.1)] px-1.5 py-[3px] font-mono text-[9px] tracking-[0.14em] text-[#5B8CFF]">
              PRO
            </span>
          )}
        </div>

        <div className="flex items-center justify-between px-[18px] pt-1.5 pb-2.5">
          <span className="font-mono text-[10px] tracking-[0.18em] text-[#61697A]">
            WORKFLOWS
          </span>
          <button
            type="button"
            onClick={handleCreateWorkflow}
            disabled={isPending || !isDatabaseConfigured}
            title={
              isDatabaseConfigured
                ? "New workflow"
                : "Connect a database to create workflows"
            }
            className="grid size-[22px] place-items-center rounded-[7px] border border-white/[0.07] text-[#9AA2B1] transition-colors hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
          >
            <PlusIcon className="size-[13px]" strokeWidth={2} />
            <span className="sr-only">New workflow</span>
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2.5 pb-2.5">
          {open && (
            <WorkflowListItems
              workflows={workflows}
              pathname={pathname}
              isDatabaseConfigured={isDatabaseConfigured}
            />
          )}
        </div>

        {/* Plan card — the design's accent panel at the foot of the list. */}
        <Link
          href="/billing"
          className="m-2.5 rounded-xl border border-[rgba(91,140,255,0.18)] bg-[linear-gradient(150deg,rgba(91,140,255,0.13),rgba(124,92,255,0.06))] p-3 transition-colors hover:border-[rgba(91,140,255,0.35)]"
        >
          <div className="mb-1 flex items-center gap-2">
            <span className="text-xs font-semibold">
              {isPro ? "Pro plan" : "Free plan"}
            </span>
            <span className="flex-1" />
            <span className="font-mono text-[9px] tracking-[0.12em] text-[#8CA8FF]">
              {isPro ? "MANAGE" : "UPGRADE"}
            </span>
          </div>
          <p className="text-[11px] leading-[1.5] text-[#7C8494]">
            {isPro
              ? "Agent nodes and session replays are unlocked."
              : "Unlock Agent nodes and session replays."}
          </p>
        </Link>
      </div>
    </div>
  )
}
