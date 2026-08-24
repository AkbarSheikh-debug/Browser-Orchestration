"use client"

import { ReactNode } from "react"
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense"
import { Loader2 } from "lucide-react"

export function Room({
  roomId,
  children,
}: {
  roomId: string
  children: ReactNode
}) {
  return (
    <LiveblocksProvider
      throttle={16}
      authEndpoint="/api/liveblocks/auth"
      resolveUsers={async ({ userIds }) => {
        try {
          const response = await fetch("/api/liveblocks/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userIds }),
          })

          if (!response.ok) {
            return undefined
          }

          return await response.json()
        } catch {
          return undefined
        }
      }}
    >
      <RoomProvider id={roomId}>
        <ClientSideSuspense
          fallback={
            <div className="flex size-full items-center justify-center bg-[#0A0B0F]">
              <Loader2 className="size-6 animate-spin text-[#5A6273]" />
            </div>
          }
        >
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  )
}
