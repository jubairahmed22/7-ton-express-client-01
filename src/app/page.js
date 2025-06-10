import ChunkData from "./components/HomePage/ChunkData";
import '../styles/globals.css'

export default function Home() {
  return (
    <div className="text-center py-10 ">
      <h1 className="text-3xl font-bold mb-4 fontPoppins">7tonexpress</h1>
      {/* <p className="text-lg">A complete authentication asdf system with Next.js and Node.js</p> */}
      <ChunkData></ChunkData>
    </div>
  )
}