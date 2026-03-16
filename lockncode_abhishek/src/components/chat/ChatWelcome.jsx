"use client"

import { ShieldCheck, Sparkles } from "lucide-react"

import { STARTER_PROMPTS } from "@/lib/chat-contract"

export default function ChatWelcome({ onPromptSelect }) {
  return (
    <div className="mx-auto flex max-w-3xl flex-1 flex-col justify-center px-4 py-10 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl border border-cyan-500/20 bg-cyan-500/10">
        <Sparkles className="h-7 w-7 text-cyan-300" />
      </div>
      <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
        Ask safer cybersecurity questions
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-400">
        This assistant helps with phishing awareness, prompt injection defense, secure response planning, and
        cyber hygiene without generating harmful content.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {STARTER_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            className="block max-w-none rounded-2xl border border-slate-800 bg-slate-900/80 p-5 text-left text-sm font-medium normal-case leading-6 text-slate-200 transition hover:border-cyan-500/30 hover:bg-slate-900"
            onClick={() => onPromptSelect(prompt)}
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-center gap-2 text-sm text-emerald-300">
        <ShieldCheck className="h-4 w-4" />
        Inputs and outputs are screened for manipulation and harmful instructions.
      </div>
    </div>
  )
}
