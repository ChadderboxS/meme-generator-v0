import { NextResponse } from "next/server"
import type { MemeApiResponse } from "@/types/meme"

export async function GET() {
  try {
    const response = await fetch("https://api.imgflip.com/get_memes")

    if (!response.ok) {
      throw new Error(`Failed to fetch memes: ${response.status}`)
    }

    const data: MemeApiResponse = await response.json()

    if (!data.success) {
      throw new Error("API returned unsuccessful response")
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching memes:", error)
    return NextResponse.json({ error: "Failed to fetch memes" }, { status: 500 })
  }
}
