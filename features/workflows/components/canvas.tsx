"use client"

import { useSyncExternalStore } from "react"
import {
  Background,
  BackgroundVariant,
  ConnectionLineType,
  ReactFlow,
  useReactFlow,
  useStore,
  type Edge,
  type NodeTypes,
} from "@xyflow/react"
import { useLiveblocksFlow, Cursors } from "@liveblocks/react-flow"
import { Frame, Minus, Plus } from "lucide-react"

import { StepNode } from "@/features/workflows/components/step-node"
import type { StepNodeType } from "@/features/workflows/nodes/node-registry"

import "@xyflow/react/dist/style.css"
import "@liveblocks/react-ui/styles.css"
import "@liveblocks/react-flow/styles.css"

const nodeTypes: NodeTypes = { step: StepNode }

const initialNodes: StepNodeType[] = [
  {
    id: "start",
    type: "step",
    position: { x: 0, y: 0 },
    data: { type: "start", kind: "trigger", title: "Start", values: {} },
  },
]

const initialEdges: Edge[] = []

const emptySubscribe = () => () => {}

// False during server render and hydration, true after mount. Keeps the
// server and initial client render identical to avoid a hydration mismatch.
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
}

// The design's zoom cluster: a single frosted pill in the bottom-left corner
// stacking zoom in / out / fit over a live zoom readout.
function ZoomControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow()
  const zoom = useStore((s) => s.transform[2])

  const button =
    "grid h-[34px] w-9 place-items-center text-[#9AA2B1] transition-colors hover:bg-white/[0.06] hover:text-white"

  return (
    <div className="absolute bottom-4 left-4 z-20 flex flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-[rgba(16,18,23,0.82)] shadow-[0_16px_34px_-18px_rgba(0,0,0,0.9)] backdrop-blur-[14px]">
      <button type="button" onClick={() => zoomIn()} className={button}>
        <Plus className="size-[15px]" />
      </button>
      <button
        type="button"
        onClick={() => zoomOut()}
        className={`${button} border-t border-white/[0.06]`}
      >
        <Minus className="size-[15px]" />
      </button>
      <button
        type="button"
        onClick={() => fitView()}
        className={`${button} border-t border-white/[0.06]`}
      >
        <Frame className="size-3.5" />
      </button>
      <div className="grid h-[30px] w-9 place-items-center border-t border-white/[0.06] font-mono text-[9px] text-[#6E7684]">
        {Math.round(zoom * 100)}%
      </div>
    </div>
  )
}

// The mono counter the design pins to the canvas's top-left corner.
function CanvasMeta() {
  const nodeCount = useStore((s) => s.nodes.length)
  const edgeCount = useStore((s) => s.edges.length)

  return (
    <div className="pointer-events-none absolute top-3.5 left-4 z-20 font-mono text-[10px] tracking-[0.14em] text-[#454C5B]">
      CANVAS · {nodeCount} NODES · {edgeCount} EDGES
    </div>
  )
}

export function Canvas() {
  const mounted = useMounted()
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow({
      suspense: true,
      nodes: { initial: initialNodes },
      edges: { initial: initialEdges },
    })

  return (
    <div className="relative size-full overflow-hidden bg-[#0A0B0F]">
      {/* Ambient wash and vignette sit under the flow — React Flow itself paints
          transparent, so these read behind the grid, edges, and nodes. */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(620px_420px_at_28%_12%,rgba(91,140,255,0.16),transparent_70%),radial-gradient(540px_400px_at_82%_88%,rgba(0,229,255,0.09),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_140px_40px_rgba(0,0,0,0.55)]" />

      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
        colorMode="dark"
        fitView
        proOptions={{ hideAttribution: true }}
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionLineStyle={{ stroke: "#5B8CFF", strokeWidth: 1.8 }}
        defaultEdgeOptions={{
          type: "smoothstep",
          style: { stroke: "rgba(255,255,255,0.13)", strokeWidth: 1.6 },
        }}
        style={
          {
            "--xy-background-color": "transparent",
            "--xy-edge-stroke-width": 1.6,
            "--xy-connectionline-stroke-width": 1.8,
          } as React.CSSProperties
        }
        maxZoom={1}
      >
        <Background
          variant={BackgroundVariant.Lines}
          gap={34}
          lineWidth={1}
          color="rgba(255,255,255,0.024)"
        />
        {/* Presence cursors only render once mounted — they depend on the live
            room, which isn't available during the server render. */}
        {mounted && <Cursors />}
      </ReactFlow>

      <CanvasMeta />
      <ZoomControls />
    </div>
  )
}
