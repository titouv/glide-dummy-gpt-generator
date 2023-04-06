export default function Footer() {
  return (
    <div className="text-sm pt-8 text-center">
      <span className="border border-gray-400 p-2 mb-4 max-w-[60ch] mx-auto rounded-md text-gray-400 block">
        Note : No API Token is sent to the server. Only the names of the columns
        are sent to the server to be able to generate.
      </span>
      Developped by <span className="font-bold">Titouan VERHILLE</span> for{" "}
      <br />
      <a
        className="underline underline-offset-2"
        href="https://www.glideapps.com/experts/datapix"
      >
        Datapix French Node Code Agency
      </a>{" "}
      - Glide Certified Premium Expert
    </div>
  )
}
