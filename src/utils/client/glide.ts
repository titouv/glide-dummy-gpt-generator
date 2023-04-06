import * as glide from "@glideapps/tables"
import { GlideJsInfo } from "./parseJs"

export function addRowsToGlide({
  glideInfo,
  formattedRows,
}: {
  glideInfo: GlideJsInfo
  formattedRows: { [key: string]: string }[]
}) {
  const { appId, table, token, columnsValues } = glideInfo

  const glideTable = glide.table({
    token: token,
    app: appId,
    table: table,
    columns: columnsValues,
  })

  return glideTable.addRows(formattedRows)
}
