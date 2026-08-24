import { auth } from "@clerk/nextjs/server"

import { createWorkflowAction } from "@/features/workflows/actions"
import { WorkflowNav } from "@/features/workflows/components/workflow-nav"
import { listWorkflows } from "@/features/workflows/data"

// Loads the active organization's workflows on the server and hands them to the
// client nav, which owns the rail's collapse state and the active-route styling.
export async function AppSidebar() {
  const { orgId } = await auth()

  // No DATABASE_URL is a setup state, not a failure — the sidebar sits in the
  // dashboard layout, so throwing here would take Billing and every other route
  // down with it. Skip the query and let the nav show what's missing instead.
  // A configured-but-broken database still throws, so real faults stay visible.
  const isDatabaseConfigured = Boolean(process.env.DATABASE_URL)

  const workflows =
    isDatabaseConfigured && orgId ? await listWorkflows(orgId) : []

  return (
    <WorkflowNav
      workflows={workflows}
      onCreateWorkflow={createWorkflowAction}
      isDatabaseConfigured={isDatabaseConfigured}
    />
  )
}
