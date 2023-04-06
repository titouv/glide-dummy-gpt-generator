import { OpenAIStream } from "@/lib/openAI"
import { CreateChatCompletionRequest } from "openai"
import {
  ListItem,
  ObjectTable,
  createMarkdownObjectTable,
} from "parse-markdown-table"
import { GlideJsInfo } from "../client/parseJs"
import { SYSTEM_PROMPT, getRealPrompt } from "./prompts"

async function getTableRows(table: ObjectTable<string, string>) {
  let rows: ListItem<string, string>[] = []
  for await (const row of table) {
    rows.push(row)
  }
  return rows
}

export async function convertMarkdownToTable(markdown: string) {
  try {
    const table = await createMarkdownObjectTable(markdown)
    const rows = await getTableRows(table)
    return rows
  } catch (error) {
    // console.error(error)
    return []
  }
}
export type GetTableStreamParams = Parameters<typeof getTableStream>

export async function getTableStream(
  columnns: GlideJsInfo["columnsValues"],
  numRows: number
) {
  console.log("Generating completion...")
  console.log("columnns", columnns, "numRows", numRows)
  const columnsString = Object.keys(columnns).join(", ")

  const payload: CreateChatCompletionRequest = {
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: getRealPrompt(columnsString, numRows.toString()),
      },
    ],
    stream: true,
    temperature: 0.2,
  }

  const encoder = new TextEncoder()
  let text = ""
  let rows: ListItem<string, string>[] = []
  const stream = new ReadableStream({
    async start(controller) {
      let hasToClose = false
      OpenAIStream(payload, async (event) => {
        console.log("event", event)
        if (event.type === "end") {
          hasToClose = true
          return
        }

        text += event.data
        let newRows = await convertMarkdownToTable(text)

        if (newRows.length > 0) {
          rows = newRows
          console.log("here rows", rows)
          controller.enqueue(
            encoder.encode("data: " + JSON.stringify(rows) + "\n")
          )
        }
        if (hasToClose) {
          controller.close()
        }
      })
    },
  })
  return stream
}
