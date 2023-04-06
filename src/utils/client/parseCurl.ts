export interface GlideCurlInfo {
  appId: string
  token: string
  table: string
  columnsValues: {
    [key: string]: string
  }
}

export function parseGlideCurl(curlRequest: string): GlideCurlInfo {
  // GET via regex all auth token, appID, table name, and column names
  const headersRegex = /--header '([^']+): ([^\']+)'(?:\\?)/g
  const dataRegex = /--data-raw '([^']+)'/

  const dataMatch = curlRequest.match(dataRegex)?.[1]

  const headers: Record<string, string> = {}
  let headerMatch: RegExpExecArray | null
  while ((headerMatch = headersRegex.exec(curlRequest)) !== null) {
    headers[headerMatch[1]] = headerMatch[2]
  }
  const data = dataMatch ? JSON.parse(dataMatch) : undefined
  return {
    appId: data.appID,
    token: headers["Authorization"].split(" ")[1],
    table: data.mutations[0].tableName,
    columnsValues: data.mutations[0].columnValues,
  }
}
