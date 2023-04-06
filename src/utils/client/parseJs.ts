import { ColumnType } from "@glideapps/tables/dist/types"

export function parseStringToObject(
  stringToParse: string
): Record<string, any> {
  const cleanString = stringToParse
    .replace(/columns: {/, "")
    .replace(/}$/, "")
    .trim()

  const propertyPattern = /(.*): {.*type: "(.*)",.*name: "(.*)" },?/g

  const result: Record<string, any> = {}
  let match: RegExpExecArray | null

  while ((match = propertyPattern.exec(cleanString)) !== null) {
    result[match[1].trim()] = {
      type: match[2],
      name: match[3],
    }
  }

  return result
}

export interface GlideJsInfo {
  token: string
  appId: string
  table: string
  columnsValues: {
    [key: string]: {
      type: ColumnType
      name: string
    }
  }
}

export function parseGlideJs(code: string): GlideJsInfo {
  const tokenRegex = /token:\s*"(.+?)"/
  const appRegex = /app:\s*"(.+?)"/
  const tableRegex = /table:\s*"(.+?)"/
  const columnsRegex = /columns:\s*{([\s\S]*?}\s*})\s*}/

  const tokenMatch = tokenRegex.exec(code)
  const appMatch = appRegex.exec(code)
  const tableMatch = tableRegex.exec(code)
  const columnsMatch = columnsRegex.exec(code)

  if (tokenMatch && appMatch && tableMatch && columnsMatch) {
    const token = tokenMatch[1]
    const app = appMatch[1]
    const table = tableMatch[1]
    const parsedColumns = parseStringToObject(columnsMatch[0])

    return { token, appId: app, table, columnsValues: parsedColumns }
  } else {
    throw new Error("Invalid Glide code format")
  }
}
