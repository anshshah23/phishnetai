"use client"

import { Bot, Shield, User } from "lucide-react"

import ChatMarkdown from "@/components/chat/ChatMarkdown"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default function ChatMessage({ message }) {
  const isAssistant = message.role === "assistant"
  const isBlocked = Boolean(message?.safety?.blocked)

  return (
    <div className={`flex gap-4 ${isAssistant ? "" : "justify-end"}`}>
      {isAssistant && (
        <Avatar className="h-10 w-10 border border-cyan-400/20 bg-cyan-500/10 shadow-lg shadow-cyan-500/10">
          <AvatarFallback className="bg-transparent text-cyan-200">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={`max-w-3xl rounded-[28px] border px-5 py-4 shadow-lg ${
          isAssistant
            ? "border-slate-800/90 bg-slate-900/95 text-slate-100 shadow-slate-950/50"
            : "border-cyan-500/20 bg-cyan-500/10 text-slate-50 shadow-cyan-950/30"
        }`}
      >
        <div className="mb-3 flex items-center gap-2">
          <span className="text-sm font-semibold text-white">
            {isAssistant ? "Security Assistant" : "You"}
          </span>
          {isBlocked && (
            <Badge className="border border-amber-500/20 bg-amber-500/10 text-amber-300 hover:bg-amber-500/10">
              <Shield className="mr-1 h-3 w-3" />
              Safety filtered
            </Badge>
          )}
        </div>
        {isAssistant ? (
          <ChatMarkdown content={message.content} />
        ) : (
          <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-100">
            {message.content}
          </p>
        )}
        {message?.safety?.reason && (
          <p className="mt-3 text-xs text-amber-200/90">{message.safety.reason}</p>
        )}
      </div>

      {!isAssistant && (
        <Avatar className="h-10 w-10 border border-slate-700 bg-slate-800">
          <AvatarFallback className="bg-transparent text-slate-200">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}
