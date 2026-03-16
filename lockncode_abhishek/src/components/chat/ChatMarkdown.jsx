"use client"

function renderInline(text) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean)

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${part}-${index}`} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      )
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={`${part}-${index}`}
          className="rounded-md border border-slate-700 bg-slate-950 px-1.5 py-0.5 text-[0.92em] text-cyan-200"
        >
          {part.slice(1, -1)}
        </code>
      )
    }

    return <span key={`${part}-${index}`}>{part}</span>
  })
}

function parseBlocks(markdown) {
  const lines = markdown.replace(/\r/g, "").split("\n")
  const blocks = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]

    if (!line.trim()) {
      index += 1
      continue
    }

    if (line.startsWith("```")) {
      const codeLines = []
      index += 1
      while (index < lines.length && !lines[index].startsWith("```")) {
        codeLines.push(lines[index])
        index += 1
      }
      blocks.push({ type: "code", content: codeLines.join("\n") })
      index += 1
      continue
    }

    if (/^#{1,3}\s/.test(line)) {
      blocks.push({
        type: "heading",
        level: line.match(/^#+/)[0].length,
        content: line.replace(/^#{1,3}\s/, "")
      })
      index += 1
      continue
    }

    if (/^\d+\.\s/.test(line)) {
      const items = []
      while (index < lines.length && /^\d+\.\s/.test(lines[index])) {
        items.push(lines[index].replace(/^\d+\.\s/, ""))
        index += 1
      }
      blocks.push({ type: "ordered-list", items })
      continue
    }

    if (/^[-*]\s/.test(line)) {
      const items = []
      while (index < lines.length && /^[-*]\s/.test(lines[index])) {
        items.push(lines[index].replace(/^[-*]\s/, ""))
        index += 1
      }
      blocks.push({ type: "unordered-list", items })
      continue
    }

    const paragraph = [line]
    index += 1
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^#{1,3}\s/.test(lines[index]) &&
      !/^\d+\.\s/.test(lines[index]) &&
      !/^[-*]\s/.test(lines[index]) &&
      !lines[index].startsWith("```")
    ) {
      paragraph.push(lines[index])
      index += 1
    }
    blocks.push({ type: "paragraph", content: paragraph.join(" ") })
  }

  return blocks
}

export default function ChatMarkdown({ content }) {
  const blocks = parseBlocks(content || "")

  return (
    <div className="space-y-4 text-sm leading-7 text-slate-200">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const className =
            block.level === 1
              ? "text-xl font-semibold text-white"
              : block.level === 2
                ? "text-lg font-semibold text-white"
                : "text-base font-semibold text-white"

          return (
            <h3 key={`${block.type}-${index}`} className={className}>
              {renderInline(block.content)}
            </h3>
          )
        }

        if (block.type === "code") {
          return (
            <pre
              key={`${block.type}-${index}`}
              className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-cyan-200"
            >
              <code>{block.content}</code>
            </pre>
          )
        }

        if (block.type === "ordered-list") {
          return (
            <ol key={`${block.type}-${index}`} className="space-y-2 pl-5 marker:text-cyan-300">
              {block.items.map((item, itemIndex) => (
                <li key={`${item}-${itemIndex}`} className="pl-1">
                  {renderInline(item)}
                </li>
              ))}
            </ol>
          )
        }

        if (block.type === "unordered-list") {
          return (
            <ul key={`${block.type}-${index}`} className="space-y-2 pl-5 marker:text-cyan-300">
              {block.items.map((item, itemIndex) => (
                <li key={`${item}-${itemIndex}`} className="list-disc pl-1">
                  {renderInline(item)}
                </li>
              ))}
            </ul>
          )
        }

        return (
          <p key={`${block.type}-${index}`} className="break-words">
            {renderInline(block.content)}
          </p>
        )
      })}
    </div>
  )
}
