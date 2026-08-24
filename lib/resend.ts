import { Resend } from "resend"

let client: Resend | undefined

function getClient(): Resend {
  if (client) return client

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY is not set. Add it to .env.local — copy it from https://resend.com/api-keys"
    )
  }

  client = new Resend(apiKey)
  return client
}

// Built on first use, so only a run that actually reaches a Send Email node
// needs the key — adding the node to a canvas does not.
export const resend = new Proxy({} as Resend, {
  get(_target, prop) {
    const instance = getClient()
    const value = Reflect.get(instance, prop, instance)
    return typeof value === "function" ? value.bind(instance) : value
  },
})
