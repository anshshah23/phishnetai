"use client"

import { FileDown, MessageSquarePlus, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function ChatSidebar({ className = "", onNewChat, onExport, canExport }) {
  return (
    <aside
      className={`flex h-full w-full flex-col items-center border-r border-slate-800/80 bg-slate-950/90 px-3 py-5 backdrop-blur-xl ${className}`}
    >
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10">
        <Sparkles className="h-5 w-5 text-cyan-300" />
      </div>

      <div className="flex flex-col gap-3">
        <Button
          size="icon"
          className="h-12 w-12 rounded-2xl bg-cyan-500 text-slate-950 hover:bg-cyan-400"
          onClick={onNewChat}
          title="New chat"
        >
          <MessageSquarePlus className="h-5 w-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-2xl border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 hover:text-white"
          onClick={onExport}
          disabled={!canExport}
          title="Export PDF"
        >
          <FileDown className="h-5 w-5" />
        </Button>
      </div>
    </aside>
  )
}
