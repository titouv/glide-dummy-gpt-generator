import {
  ParsedEvent,
  ReconnectInterval,
  createParser,
} from "eventsource-parser"
import { CreateChatCompletionRequest } from "openai"

type Event = { type: "end" } | { type: "message"; data: string }

export async function OpenAIStream(
  payload: CreateChatCompletionRequest,
  onEvent: (event: Event) => void
) {
  console.log("payload", payload)
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify(payload),
  })

  const decoder = new TextDecoder("utf-8")

  let counter = 0
  function onParse(event: ParsedEvent | ReconnectInterval) {
    if (event.type === "event") {
      const data = event.data
      // https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
      if (data === "[DONE]") {
        onEvent({ type: "end" })
        return
      }
      try {
        const json = JSON.parse(data)
        const text = json.choices[0].delta?.content || ""
        if (counter < 2 && (text.match(/\n/) || []).length) {
          // this is a prefix character (i.e., "\n\n"), do nothing
          return
        }
        onEvent({ type: "message", data: text })
        counter++
      } catch (e) {
        // maybe parse error
      }
    }
  }

  // stream response (SSE) from OpenAI may be fragmented into multiple chunks
  // this ensures we properly read chunks and invoke an event for each SSE event stream
  const parser = createParser(onParse)
  // https://web.dev/streams/#asynchronous-iteration
  for await (const chunk of res.body as any) {
    parser.feed(decoder.decode(chunk))
  }
}
