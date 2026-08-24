import type { Node } from "@xyflow/react"
import {
  Bot,
  Eye,
  Globe,
  Mail,
  MousePointerClick,
  Pointer,
  ScanText,
  type LucideIcon,
} from "lucide-react"

export type StepNodeKind = "trigger" | "action"

// One editable field on a node, rendered as an input in the inspector.
export type NodeField = {
  key: string
  label: string
  placeholder?: string
  // Render as a multi-line textarea instead of a single-line input.
  multiline?: boolean
  required?: boolean
}

export type NodeOutput = {
  path: string
  label: string
}

// A node type's manifest entry. Add a node by adding an entry to nodeRegistry.
export type NodeDefinition = {
  type: string
  kind: StepNodeKind
  label: string
  icon: LucideIcon
  // Tailwind classes for the icon chip: the gradient fill, its glow, and the
  // icon color that reads against it. Kept as one string so every surface that
  // draws the chip (canvas node, palette row, log row) stays identical.
  accent: string
  // Short mono label shown beside the node in the palette and on the canvas.
  tag: string
  fields: NodeField[]
  outputs: NodeOutput[]
}

export const nodeRegistry = {
  start: {
    type: "start",
    kind: "trigger",
    label: "Start",
    icon: MousePointerClick,
    accent:
      "bg-[linear-gradient(160deg,#5B9DFF,#2F6BFF)] text-white shadow-[0_6px_16px_-6px_rgba(59,130,246,0.9)]",
    tag: "TRIGGER",
    fields: [],
    outputs: [],
  },
  "open-url": {
    type: "open-url",
    kind: "action",
    label: "Open URL",
    icon: Globe,
    accent:
      "bg-[linear-gradient(160deg,#1BE39B,#06A97A)] text-[#03301F] shadow-[0_6px_16px_-6px_rgba(16,229,160,0.9)]",
    tag: "NAV",
    fields: [
      { key: "url", label: "URL", placeholder: "https://youtube.com", required: true },
    ],
    outputs: [
      { path: "url", label: "URL" },
      { path: "title", label: "Title" },
    ],
  },
  act: {
    type: "act",
    kind: "action",
    label: "Act",
    icon: Pointer,
    accent:
      "bg-[linear-gradient(160deg,#A78BFA,#7C3AED)] text-white shadow-[0_6px_16px_-6px_rgba(139,92,246,0.9)]",
    tag: "CLICK",
    fields: [
      {
        key: "instruction",
        label: "Instruction",
        placeholder: "Click the sign in button",
        multiline: true,
        required: true,
      },
    ],
    outputs: [
      { path: "success", label: "Success" },
      { path: "message", label: "Message" },
      { path: "url", label: "URL" },
    ],
  },
  extract: {
    type: "extract",
    kind: "action",
    label: "Extract",
    icon: ScanText,
    accent:
      "bg-[linear-gradient(160deg,#FFC34D,#E8930B)] text-[#3A2500] shadow-[0_6px_16px_-6px_rgba(245,165,36,0.9)]",
    tag: "DATA",
    fields: [
      {
        key: "instruction",
        label: "Instruction",
        placeholder: "Extract the product price",
        multiline: true,
        required: true,
      },
    ],
    outputs: [{ path: "extraction", label: "Extraction" }],
  },
  observe: {
    type: "observe",
    kind: "action",
    label: "Observe",
    icon: Eye,
    accent:
      "bg-[linear-gradient(160deg,#7DD3FC,#0EA5E9)] text-[#04283A] shadow-[0_6px_16px_-6px_rgba(56,189,248,0.9)]",
    tag: "READ",
    fields: [
      {
        key: "instruction",
        label: "Instruction",
        placeholder: "Find the sign in button",
        multiline: true,
        required: true,
      },
    ],
    outputs: [
      { path: "matches", label: "Matches" },
      { path: "matches[0].selector", label: "Selector" },
      { path: "matches[0].description", label: "Description" },
    ],
  },
  agent: {
    type: "agent",
    kind: "action",
    label: "Agent",
    icon: Bot,
    accent:
      "bg-[linear-gradient(160deg,#FF5C86,#F0134D)] text-white shadow-[0_6px_16px_-6px_rgba(251,44,90,0.9)]",
    tag: "AUTO",
    fields: [
      {
        key: "instruction",
        label: "Instruction",
        placeholder: "Search for the stock price of NVDA",
        multiline: true,
        required: true,
      },
    ],
    outputs: [
      { path: "success", label: "Success" },
      { path: "message", label: "Message" },
      { path: "completed", label: "Completed" },
    ],
  },
  "send-email": {
    type: "send-email",
    kind: "action",
    label: "Send Email",
    icon: Mail,
    accent:
      "bg-[linear-gradient(160deg,#FF9040,#F2610C)] text-white shadow-[0_6px_16px_-6px_rgba(255,106,0,0.9)]",
    tag: "OUT",
    fields: [
      { key: "to", label: "To", placeholder: "person@example.com", required: true },
      { key: "subject", label: "Subject", placeholder: "Hello", required: true },
      {
        key: "body",
        label: "Body",
        placeholder: "Write your message…",
        multiline: true,
        required: true,
      },
    ],
    outputs: [{ path: "id", label: "Email ID" }],
  },
} satisfies Record<string, NodeDefinition>

export type NodeType = keyof typeof nodeRegistry

// Plain JSON only (synced through Liveblocks). `type` keys into the registry;
// kind and title are denormalized so the server can read them without it.
export type StepNodeData = {
  type: NodeType
  kind: StepNodeKind
  title: string
  values: Record<string, string>
}

export type StepNodeType = Node<StepNodeData, "step">

export type ActionNodeType = {
  [K in NodeType]: (typeof nodeRegistry)[K]["kind"] extends "action" ? K : never
}[NodeType]
