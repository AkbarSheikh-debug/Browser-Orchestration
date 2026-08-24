import { defineConfig } from "@trigger.dev/sdk"

// Your Trigger.dev project reference (starts with `proj_`), from the project's
// settings page. Kept in the environment so this repo carries no account IDs.
const projectRef = process.env.TRIGGER_PROJECT_REF

if (!projectRef) {
  throw new Error(
    "TRIGGER_PROJECT_REF is not set — copy it from your Trigger.dev project settings into .env.local"
  )
}

export default defineConfig({
  project: projectRef,
  runtime: "node",
  logLevel: "log",
  // The max compute seconds a task may run before it is stopped. Browser
  // workflows are long-lived, so this is generous; override per task if needed.
  maxDuration: 3600,
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
  dirs: ["features"],
})
