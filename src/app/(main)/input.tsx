"use client"

import "@glideapps/glide-data-grid/dist/index.css"
import DataEditor, {
  CompactSelection,
  GridCell,
  GridCellKind,
  GridColumn,
  GridSelection,
  Item,
} from "@glideapps/glide-data-grid"
import { useEffect, useState } from "react"
import { Orbit, DotPulse } from "@uiball/loaders"
import Image from "next/image"
import { addRowsToGlide } from "@/utils/client/glide"
import { GlideJsInfo, parseGlideJs } from "@/utils/client/parseJs"
import { GetTableStreamParams } from "@/utils/server/getTableStream"

const MAX_ROWS = 10

export function Input() {
  const [glideRequest, setGlideRequest] = useState<string>()
  const [glideInfo, setGlideInfo] = useState<GlideJsInfo>()
  const [rows, setRows] = useState<any[]>([])
  const [firstLoad, setFirstLoad] = useState(true)
  const [loadingTable, setLoadingTable] = useState(false)
  const [loadingGlide, setLoadingGlide] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [numberOfRows, setNumberOfRows] = useState(3)

  async function makeRequest() {
    setLoadingTable(true)
    setError(null)
    if (!glideInfo) {
      setError("No Glide INFO")
      return
    }
    const selectedColumnsIndexes = selection.columns.toArray()
    const selectedColumns = selectedColumnsIndexes.reduce((prev, cur) => {
      const col = columns[cur]
      if (!col) {
        return prev
      }
      return {
        ...prev,
        [col.title]: glideInfo.columnsValues[col.title],
      }
    }, {} as GlideJsInfo["columnsValues"])

    const payload: GetTableStreamParams = [selectedColumns, numberOfRows]

    const res = await fetch("/api/getTableStream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    const data = res.body
    if (!data) {
      return
    }
    const reader = data.getReader()
    const decoder = new TextDecoder("utf-8")
    let lastParsed: {
      [key: string]: string
    }[] = []

    setLoadingTable(false)
    let done = false
    let tempValue: string = ""
    while (!done) {
      const { done: isDone, value } = await reader.read()
      if (isDone) {
        console.log("done")
        done = true
        break
      }
      let chunkValue = decoder.decode(value)
      if (tempValue) {
        chunkValue = tempValue + chunkValue
        tempValue = ""
      }
      const splitted = chunkValue.split("data: ")
      for (const s of splitted) {
        try {
          const formatted = s.trim().replace(/(\r\n|\n|\r)/gm, "")
          if (formatted.length > 0) {
            const parsed = JSON.parse(formatted)
            lastParsed = parsed
            setRows(parsed)
          }
        } catch (error) {
          console.log("error", error)
          tempValue = chunkValue
          break
        }
      }
    }

    setLoadingGlide(true)
    console.log(lastParsed)
    await addRowsToGlide({
      glideInfo,
      formattedRows: lastParsed,
    })
    console.log(lastParsed)
    setLoadingGlide(false)
  }

  useEffect(() => {
    if (!glideRequest) {
      return
    }
    async function fetchGlideInfo() {
      if (!glideRequest) {
        return
      }
      try {
        const glideJsInfo = parseGlideJs(glideRequest)
        setGlideInfo(glideJsInfo)
      } catch (error) {
        setError("Error parsing CURL")
      }
    }
    fetchGlideInfo()
  }, [glideRequest])

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const content = event.clipboardData?.getData("text/plain")
      setGlideRequest(content!)
    }

    window.addEventListener("paste", handlePaste)

    return () => {
      window.removeEventListener("paste", handlePaste)
    }
  }, [])

  const columns: GridColumn[] = []
  if (glideInfo) {
    const keys = Object.keys(glideInfo.columnsValues)
    keys.forEach((key) => {
      columns.push({
        title: key,
        id: key,
        // width: 768 / keys.length,
      })
    })
  }

  function getData([col, row]: Item): GridCell {
    if (col > columns.length - 1 || row > rows.length - 1) {
      return {
        data: "",
        kind: GridCellKind.Text,
        allowOverlay: false,
        displayData: "",
      }
    }
    const rowData = rows[row]
    if (!rowData) {
      throw new Error("Invalid cell")
    }
    const columnName = columns[col].title
    return {
      kind: GridCellKind.Text,
      data:
        rowData[columnName] ||
        rowData[columnName.toLowerCase()] ||
        rowData[columnName.toUpperCase()] ||
        rowData[columnName.charAt(0).toUpperCase() + columnName.slice(1)] ||
        "",
      allowOverlay: false,
      displayData:
        rowData[columnName] ||
        rowData[columnName.toLowerCase()] ||
        rowData[columnName.toUpperCase()] ||
        rowData[columnName.charAt(0).toUpperCase() + columnName.slice(1)] ||
        "",
    }
  }

  useEffect(() => {
    if (firstLoad) {
      setFirstLoad(false)
    }
  }, [firstLoad])

  const [selection, setSelection] = useState<GridSelection>({
    columns: CompactSelection.empty(),
    rows: CompactSelection.empty(),
  })

  return (
    <div className="flex  flex-col pt-16 ">
      {!glideInfo && (
        <div className="">
          <div className="grid grid-cols-2 gap-8  py-8 ">
            <Image
              priority
              src="/instruc_1.jpg"
              alt="Glide CURL"
              width={300}
              height={200}
              className="w-full rounded-md shadow-2xl shadow-cyan-400/10"
            />
            <Image
              width={300}
              priority
              height={200}
              src="/instruc_2.jpg"
              alt="Glide CURL"
              className="w-full rounded-md shadow-2xl shadow-cyan-400/10"
            />
          </div>
          <button
            className="rounded-full shadow-lg shadow-cyan-400/20 hover:shadow-cyan-400/30 transition-all duration-300 w-full my-4 px-4 py-2 bg-cyan-600 text-white disabled:opacity-50"
            onClick={() => {
              navigator.clipboard.readText().then((text) => {
                setGlideRequest(text)
              })
            }}
          >
            Paste or <span className="font-semibold font-mono">CTRL-V</span>{" "}
            Glide API javascript request
          </button>
          <p className="text-center">
            Paste your Glide <span className="font-bold"> JS API </span> request
            here to generate dummy data for your tables
          </p>

          {error && (
            <div className="bg-red-500 p-4 rounded-md mt-4">
              Verify that you have copied the correct CURL
            </div>
          )}
        </div>
      )}
      {glideInfo && (
        <div>
          <p>
            Select the different columns you want to generate data for and click
            generate
          </p>
          <div className="flex justify-between py-4 ">
            <label className="text-xl flex items-center gap-2 font-bold">
              Number of rows
              <div className="flex  gap-2">
                <button
                  className="rounded-full w-10 h-10 bg-gray-500 text-white font-bold text-xl disabled:opacity-50"
                  disabled={numberOfRows == 1}
                  onClick={() => {
                    setNumberOfRows(numberOfRows - 1)
                  }}
                >
                  -
                </button>
                <div className="w-8 flex items-center justify-center proportional-nums text-2xl font-bold">
                  {numberOfRows}
                </div>
                <button
                  className="rounded-full w-10 h-10 bg-gray-500 text-white font-bold text-xl disabled:opacity-50"
                  disabled={numberOfRows == MAX_ROWS}
                  onClick={() => {
                    setNumberOfRows(numberOfRows + 1)
                  }}
                >
                  +
                </button>
              </div>
            </label>
            <div className="flex gap-2 py-4 items-center justify-center">
              <button
                disabled={loadingTable || selection.columns.length === 0}
                className="rounded-full px-4 py-2 bg-cyan-600 text-white disabled:opacity-50"
                onClick={makeRequest}
              >
                Generate
              </button>
            </div>
          </div>
          <div className="">
            {!firstLoad && !loadingTable ? (
              <div className="relative">
                {selection.columns.length === 0 && rows.length == 0 && (
                  <div className="absolute z-40 text-center bg-black/70 rounded-md top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 px-6 p-4">
                    Please select a column to start generating data
                  </div>
                )}
                <DataEditor
                  width={768}
                  columnSelect="none"
                  onHeaderClicked={(col) => {
                    setRows([])
                    if (selection.columns.hasIndex(col)) {
                      setSelection((prev) => ({
                        ...prev,
                        columns: prev.columns.remove(col),
                      }))
                    } else {
                      setSelection((prev) => ({
                        ...prev,
                        columns: prev.columns.add(col),
                      }))
                    }
                  }}
                  className="rounded w-full shadow-2xl shadow-cyan-400/20"
                  rowHeight={40}
                  getCellContent={getData}
                  columns={columns}
                  rows={numberOfRows}
                  gridSelection={selection}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-2 items-center justify-center h-24">
                <Orbit size={25} speed={1.5} color="white" />
                Dummy data is being generated...
              </div>
            )}
            {!loadingTable &&
              rows.length > 0 &&
              (loadingGlide ? (
                <div className="flex flex-col gap-2 items-center justify-center h-24">
                  <DotPulse size={25} speed={1.5} color="white" />
                  Loading data on your Glide Apps Table...
                </div>
              ) : (
                <div className="text-center py-2">
                  <p>The content has been loaded on your Glide Apps Table</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
