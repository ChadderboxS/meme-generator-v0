import { NextResponse } from "next/server"
import type { MemeApiResponse, Meme } from "@/types/meme"

export async function GET() {
  try {
    const response = await fetch("https://api.imgflip.com/get_memes")

    if (!response.ok) {
      throw new Error(`Failed to fetch memes: ${response.status}`)
    }

    const data: MemeApiResponse = await response.json()

    if (!data.success || !data.data.memes.length) {
      throw new Error("API returned unsuccessful response or no memes")
    }

    // Get a random meme from the array
    const randomIndex = Math.floor(Math.random() * data.data.memes.length)
    const randomMeme: Meme = data.data.memes[randomIndex]

    return NextResponse.json({ success: true, meme: randomMeme })
  } catch (error) {
    console.error("Error fetching random meme:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch random meme" }, { status: 500 })
  }
}
