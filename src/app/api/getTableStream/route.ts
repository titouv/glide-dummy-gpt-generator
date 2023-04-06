import {
  GetTableStreamParams,
  getTableStream,
} from "@/utils/server/getTableStream"
import { NextResponse } from "next/server"

export const runtime = "edge"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GetTableStreamParams
    const generatedTableStream = await getTableStream(body[0], body[1])

    return new Response(generatedTableStream, {
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(error, { status: 500 })
  }
}
