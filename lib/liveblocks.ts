import { Liveblocks } from "@liveblocks/node"

let client: Liveblocks | undefined

function getClient(): Liveblocks {
  if (client) return client

  const secret = process.env.LIVEBLOCKS_SECRET_KEY
  if (!secret) {
    throw new Error(
      "LIVEBLOCKS_SECRET_KEY is not set. Add it to .env.local — copy the secret key (starts with sk_) from https://liveblocks.io/dashboard/apikeys"
    )
  }

  client = new Liveblocks({ secret })
  return client
}

// Built on first use rather than at import. The dashboard shell imports the
// workflow actions, which import this module, so an eagerly constructed client
// would fail every route in the group — including the ones that never touch
// Liveblocks. Deferring it keeps the blast radius to the workflow canvas.
export const liveblocks = new Proxy({} as Liveblocks, {
  get(_target, prop) {
    const instance = getClient()
    const value = Reflect.get(instance, prop, instance)
    return typeof value === "function" ? value.bind(instance) : value
  },
})
