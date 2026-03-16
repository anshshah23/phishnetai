"use client"

import { jsPDF } from "jspdf"
import { FileDown, Menu, MessageSquarePlus, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import ChatComposer from "@/components/chat/ChatComposer"
import ChatMessage from "@/components/chat/ChatMessage"
import ChatSidebar from "@/components/chat/ChatSidebar"
import ChatTyping from "@/components/chat/ChatTyping"
import ChatWelcome from "@/components/chat/ChatWelcome"
import { Button } from "@/components/ui/button"
import { CHAT_EXPORT_TITLE } from "@/lib/chat-contract"

const STORAGE_KEY = "phishnet-chat-session"

function formatExportTimestamp(value) {
  return new Date(value).toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  })
}

function sanitizeExportText(text) {
  return `${text || ""}`.replace(/\r/g, "").trim()
}

function createMessage(role, content, safety = null) {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    safety,
    createdAt: new Date().toISOString()
  }
}

export default function ChatPage() {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [error, setError] = useState("")
  const listRef = useRef(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    const cached = window.sessionStorage.getItem(STORAGE_KEY)
    if (!cached) return

    try {
      const parsed = JSON.parse(cached)
      if (Array.isArray(parsed)) {
        setMessages(parsed)
      }
    } catch (storageError) {
      console.error("Failed to read chat session:", storageError)
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  }, [messages])

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth"
    })
  }, [messages, isLoading])

  const hasMessages = messages.length > 0

  const resetChat = () => {
    setMessages([])
    setError("")
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(STORAGE_KEY)
    }
    setMobileSidebarOpen(false)
  }

  const exportPdf = () => {
    if (!hasMessages) return

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 16
    const cardPadding = 6
    const contentWidth = pageWidth - margin * 2
    const summaryHeight = 18
    let cursorY = margin
    let pageNumber = 1

    const drawPageHeader = () => {
      doc.setFillColor(8, 15, 32)
      doc.roundedRect(margin, cursorY, contentWidth, 24, 5, 5, "F")
      doc.setTextColor(255, 255, 255)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(16)
      doc.text(CHAT_EXPORT_TITLE, margin + 6, cursorY + 9)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(9)
      doc.setTextColor(161, 176, 201)
      doc.text("Cybersecurity conversation export", margin + 6, cursorY + 16)
      doc.text(`Exported ${formatExportTimestamp(new Date())}`, pageWidth - margin - 48, cursorY + 16)
      cursorY += 30
    }

    const drawPageFooter = () => {
      doc.setDrawColor(226, 232, 240)
      doc.setLineWidth(0.1)
      doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(8)
      doc.setTextColor(100, 116, 139)
      doc.text(`Page ${pageNumber}`, pageWidth - margin - 10, pageHeight - 7)
    }

    const startNewPage = () => {
      drawPageFooter()
      doc.addPage()
      pageNumber += 1
      cursorY = margin
      drawPageHeader()
    }

    const ensureSpace = (neededHeight) => {
      if (cursorY + neededHeight > pageHeight - 18) {
        startNewPage()
      }
    }

    drawPageHeader()

    ensureSpace(summaryHeight)
    doc.setFillColor(236, 253, 245)
    doc.setDrawColor(167, 243, 208)
    doc.roundedRect(margin, cursorY, contentWidth, summaryHeight, 4, 4, "FD")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.setTextColor(15, 23, 42)
    doc.text("Conversation Summary", margin + 5, cursorY + 7)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(51, 65, 85)
    doc.text(`${messages.length} messages exported`, margin + 5, cursorY + 13)
    cursorY += summaryHeight + 8

    messages.forEach((message) => {
      const title = message.role === "assistant" ? "Security Assistant" : "User"
      const timestamp = formatExportTimestamp(message.createdAt || new Date())
      const body = sanitizeExportText(message.content)
      const safetyNote = message?.safety?.reason
        ? `Safety note: ${sanitizeExportText(message.safety.reason)}`
        : ""

      const bodyLines = doc.splitTextToSize(body, contentWidth - cardPadding * 2)
      const safetyLines = safetyNote
        ? doc.splitTextToSize(safetyNote, contentWidth - cardPadding * 2)
        : []
      const bodyHeight = Math.max(10, bodyLines.length * 5)
      const safetyHeight = safetyLines.length > 0 ? safetyLines.length * 4 + 6 : 0
      const cardHeight = 18 + bodyHeight + safetyHeight + 8

      ensureSpace(cardHeight)

      const isAssistant = message.role === "assistant"
      if (isAssistant) {
        doc.setFillColor(15, 23, 42)
        doc.setDrawColor(51, 65, 85)
      } else {
        doc.setFillColor(236, 254, 255)
        doc.setDrawColor(165, 243, 252)
      }

      doc.roundedRect(margin, cursorY, contentWidth, cardHeight, 4, 4, "FD")
      doc.setFont("helvetica", "bold")
      doc.setFontSize(10)
      doc.setTextColor(isAssistant ? 240 : 15, isAssistant ? 249 : 23, isAssistant ? 255 : 42)
      doc.text(title, margin + cardPadding, cursorY + 7)

      doc.setFont("helvetica", "normal")
      doc.setFontSize(8)
      doc.setTextColor(isAssistant ? 148 : 71, isAssistant ? 163 : 85, isAssistant ? 184 : 105)
      doc.text(timestamp, pageWidth - margin - cardPadding - 28, cursorY + 7)

      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      doc.setTextColor(isAssistant ? 226 : 30, isAssistant ? 232 : 41, isAssistant ? 240 : 59)
      doc.text(bodyLines, margin + cardPadding, cursorY + 15)

      if (safetyLines.length > 0) {
        const safetyY = cursorY + 15 + bodyHeight + 2
        doc.setFillColor(255, 251, 235)
        doc.setDrawColor(253, 230, 138)
        doc.roundedRect(
          margin + cardPadding,
          safetyY - 4,
          contentWidth - cardPadding * 2,
          safetyHeight,
          3,
          3,
          "FD"
        )
        doc.setFont("helvetica", "bold")
        doc.setFontSize(8)
        doc.setTextColor(146, 64, 14)
        doc.text("Safety", margin + cardPadding + 3, safetyY)
        doc.setFont("helvetica", "normal")
        doc.text(safetyLines, margin + cardPadding + 3, safetyY + 5)
      }

      if (message !== messages[messages.length - 1]) {
        cursorY += cardHeight + 6
      } else {
        cursorY += cardHeight
      }
    })

    drawPageFooter()

    doc.save("phishnet-chat-export.pdf")
  }

  const sendMessage = async (content) => {
    const userMessage = createMessage("user", content)
    const nextMessages = [...messages, userMessage]

    setMessages(nextMessages)
    setIsLoading(true)
    setError("")
    setMobileSidebarOpen(false)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content: messageContent }) => ({
            role,
            content: messageContent
          }))
        })
      })

      const data = await response.json()

      if (!response.ok && !data?.reply) {
        throw new Error(data?.error || "Failed to send message.")
      }

      const assistantMessage = createMessage("assistant", data.reply, data.safety)
      setMessages((current) => [...current, assistantMessage])
    } catch (requestError) {
      console.error("Chat request failed:", requestError)
      setError("The assistant is unavailable right now. Please try again in a moment.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_25%),linear-gradient(180deg,_#020617_0%,_#0f172a_45%,_#020617_100%)] pt-16 text-white">
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden px-3 py-3 md:px-5 md:py-5">
        <div className="hidden w-20 shrink-0 lg:block">
          <ChatSidebar onNewChat={resetChat} onExport={exportPdf} canExport={hasMessages} />
        </div>

        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="w-24 max-w-[30vw]">
              <ChatSidebar onNewChat={resetChat} onExport={exportPdf} canExport={hasMessages} />
            </div>
            <button
              type="button"
              className="block max-w-none flex-1 bg-slate-950/70"
              onClick={() => setMobileSidebarOpen(false)}
              aria-label="Close chat sidebar"
            />
          </div>
        )}

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[32px] border border-slate-800/80 bg-slate-950/65 shadow-[0_30px_120px_rgba(2,6,23,0.65)] backdrop-blur-xl">
          <div className="border-b border-slate-800/80 bg-slate-950/60 px-4 py-4">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-300 hover:bg-slate-800 hover:text-white lg:hidden"
                  onClick={() => setMobileSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10">
                  <MessageSquarePlus className="h-5 w-5 text-cyan-300" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-white md:text-xl">Chat Security Assistant</h1>
                  <p className="text-sm text-slate-400">Professional cybersecurity guidance powered by Gemini</p>
                </div>
              </div>
              <div className="hidden items-center gap-2 md:flex">
                <Button
                  variant="outline"
                  className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 hover:text-white"
                  onClick={exportPdf}
                  disabled={!hasMessages}
                >
                  <FileDown className="h-4 w-4" />
                  Export PDF
                </Button>
              </div>
            </div>
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
            {!hasMessages ? (
              <ChatWelcome onPromptSelect={sendMessage} />
            ) : (
              <div className="mx-auto flex max-w-4xl flex-col gap-6 pb-4">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {isLoading && <ChatTyping />}
              </div>
            )}

            {error && (
              <div className="mx-auto mt-6 max-w-4xl rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-200">
                {error}
              </div>
            )}
          </div>

          <div className="border-t border-slate-800/80 bg-slate-950/60 px-4 py-3 md:hidden">
            <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
              <Button
                variant="outline"
                className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 hover:text-white"
                onClick={exportPdf}
                disabled={!hasMessages}
              >
                <FileDown className="h-4 w-4" />
                Export
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:bg-slate-800 hover:text-white"
                onClick={() => setMobileSidebarOpen((open) => !open)}
              >
                {mobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          <ChatComposer onSend={sendMessage} isLoading={isLoading} />
        </main>
      </div>
    </div>
  )
}
