import { NextResponse } from "next/server"

import { normalizeMessages } from "@/lib/chat-contract"
import {
  buildSafetyResponse,
  buildSystemPrompt,
  evaluateAssistantOutput,
  evaluateUserInput
} from "@/lib/chat-safety"
import { generateGeminiReply } from "@/lib/gemini"

export async function POST(request) {
  try {
    const body = await request.json()
    const messages = normalizeMessages(body?.messages)

    if (messages.length === 0) {
      return NextResponse.json(
        {
          error: "A non-empty messages array is required."
        },
        { status: 400 }
      )
    }

    const latestUserMessage = [...messages].reverse().find((message) => message.role === "user")

    if (!latestUserMessage) {
      return NextResponse.json(
        {
          error: "A user message is required."
        },
        { status: 400 }
      )
    }

    const inputSafety = evaluateUserInput(latestUserMessage.content)
    if (inputSafety.blocked) {
      return NextResponse.json(
        buildSafetyResponse(inputSafety.reason, inputSafety.categories, inputSafety.safeReply)
      )
    }

    const reply = await generateGeminiReply({
      systemPrompt: buildSystemPrompt(),
      messages
    })

    const outputSafety = evaluateAssistantOutput(reply)
    if (outputSafety.blocked) {
      return NextResponse.json(
        buildSafetyResponse(outputSafety.reason, outputSafety.categories, outputSafety.safeReply)
      )
    }

    return NextResponse.json({
      reply,
      safety: {
        blocked: false,
        reason: null,
        categories: []
      }
    })
  } catch (error) {
    console.error("Chat route failed:", error)

    const status = `${error?.message || ""}`.includes("Missing GEMINI_API_KEY") ? 503 : 500

    return NextResponse.json(
      {
        reply:
          "The chat assistant is temporarily unavailable. Please try again shortly for defensive cybersecurity guidance.",
        safety: {
          blocked: true,
          reason:
            status === 503
              ? "Gemini is not configured on the server."
              : "The assistant could not complete the request safely.",
          categories: ["service_unavailable"]
        }
      },
      { status }
    )
  }
}
