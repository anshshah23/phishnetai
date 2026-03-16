"use client"

import { ArrowUp, Loader2 } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"

export default function ChatComposer({ onSend, isLoading }) {
  const [value, setValue] = useState("")

  const submit = () => {
    const trimmed = value.trim()
    if (!trimmed || isLoading) return
    onSend(trimmed)
    setValue("")
  }

  return (
    <div className="border-t border-slate-800 bg-slate-950/90 px-4 py-4 backdrop-blur-xl">
      <div className="mx-auto max-w-4xl rounded-[28px] border border-slate-800 bg-slate-900/95 p-3 shadow-2xl">
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault()
              submit()
            }
          }}
          placeholder="Ask about phishing signs, prompt injection defenses, safe remediation, or incident response..."
          rows={1}
          className="h-12 max-h-32 w-full resize-none overflow-y-auto border-0 bg-transparent px-3 py-3 text-sm leading-6 text-slate-100 outline-none placeholder:text-slate-500"
        />
        <div className="flex items-center justify-between px-2 pt-1">
          <p className="text-xs text-slate-500">Press Enter to send, Shift+Enter for a new line.</p>
          <Button
            className="bg-cyan-500 text-slate-950 hover:bg-cyan-400"
            onClick={submit}
            disabled={isLoading || !value.trim()}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}
