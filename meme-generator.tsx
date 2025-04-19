"use client"

import type React from "react"
import type { Meme } from "@/types/meme"

import { useState, useRef, useEffect } from "react"
import { Download, Type, Palette, Sliders } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function MemeGenerator() {
  const [image, setImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [memes, setMemes] = useState<Meme[]>([])
  const [selectedMeme, setSelectedMeme] = useState<Meme | null>(null)
  const [topText, setTopText] = useState("")
  const [bottomText, setBottomText] = useState("")
  const [fontSize, setFontSize] = useState(40)
  const [fontFamily, setFontFamily] = useState("Impact")
  const [textColor, setTextColor] = useState("#ffffff")
  const [strokeColor, setStrokeColor] = useState("#000000")
  const [strokeWidth, setStrokeWidth] = useState(2)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [topTextPosition, setTopTextPosition] = useState(10) // percentage from top
  const [bottomTextPosition, setBottomTextPosition] = useState(90) // percentage from top

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDemoImage = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/memes/random")
      const data = await response.json()

      if (data.success && data.meme) {
        setSelectedMeme(data.meme)
        setImage(data.meme.url)
      } else {
        setError("Failed to load random meme")
      }
    } catch (err) {
      setError("Failed to load random meme")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (image) {
      renderMeme()
    }
  }, [
    image,
    topText,
    bottomText,
    fontSize,
    fontFamily,
    textColor,
    strokeColor,
    strokeWidth,
    topTextPosition,
    bottomTextPosition,
  ])

  useEffect(() => {
    const fetchMemes = async () => {
      try {
        const response = await fetch("/api/memes")
        const data = await response.json()

        if (data.success) {
          setMemes(data.data.memes)
        } else {
          setError("Failed to load meme templates")
        }
      } catch (err) {
        setError("Failed to load meme templates")
        console.error(err)
      }
    }

    fetchMemes()
  }, [])

  const renderMeme = () => {
    const canvas = canvasRef.current
    if (!canvas || !image) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      // Set canvas dimensions to match image
      canvas.width = img.width
      canvas.height = img.height

      // Draw image
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // Set text properties
      ctx.font = `${fontSize}px ${fontFamily}`
      ctx.textAlign = "center"
      ctx.fillStyle = textColor
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = strokeWidth

      // Calculate positions based on percentages
      const topTextY = (topTextPosition / 100) * canvas.height
      const bottomTextY = (bottomTextPosition / 100) * canvas.height

      // Draw top text
      if (topText) {
        ctx.fillText(topText, canvas.width / 2, topTextY)
        ctx.strokeText(topText, canvas.width / 2, topTextY)
      }

      // Draw bottom text
      if (bottomText) {
        ctx.fillText(bottomText, canvas.width / 2, bottomTextY)
        ctx.strokeText(bottomText, canvas.width / 2, bottomTextY)
      }
    }
    img.src = image
  }

  const downloadMeme = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement("a")
    link.download = "meme.png"
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 bg-gradient-to-br from-teal-50 to-purple-50 rounded-xl">
      <h1 className="text-3xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-purple-600">
        Meme Generator
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <Card className="md:col-span-1 border-teal-200">
          <CardHeader className="bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-t-lg">
            <CardTitle>Upload Image</CardTitle>
            <CardDescription className="text-teal-100">Choose an image for your meme</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="image-upload">Upload Image</Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="cursor-pointer"
                />
              </div>
              <div className="text-center">
                <span className="text-sm text-gray-500">or</span>
              </div>
              <Button
                variant="outline"
                className="w-full border-teal-300 hover:bg-teal-50"
                onClick={handleDemoImage}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-4 w-4 text-teal-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Loading...
                  </span>
                ) : (
                  "Use Random Meme"
                )}
              </Button>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-purple-200">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
            <CardTitle>Meme Preview</CardTitle>
            <CardDescription className="text-purple-100">Your meme will appear here</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center p-4">
            <div className="relative w-full flex justify-center">
              {image ? (
                <>
                  {selectedMeme && <p className="text-sm text-gray-500 mb-2">Template: {selectedMeme.name}</p>}
                  <canvas
                    ref={canvasRef}
                    className="max-w-full max-h-[400px] object-contain border border-gray-200 rounded-md shadow-sm"
                  />
                </>
              ) : (
                <div className="w-full h-[300px] flex items-center justify-center bg-gray-100 rounded-md border border-dashed border-gray-300">
                  <p className="text-gray-500">Upload an image or use a random meme to get started</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              onClick={downloadMeme}
              disabled={!image}
              className="bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700"
            >
              <Download className="mr-2 h-4 w-4" /> Download Meme
            </Button>
          </CardFooter>
        </Card>

        <Card className="md:col-span-3 border-gradient-to-r from-teal-200 to-purple-200">
          <CardHeader className="bg-gradient-to-r from-teal-600 to-purple-600 text-white rounded-t-lg">
            <CardTitle>Customize Your Meme</CardTitle>
            <CardDescription className="text-gray-100">Add text and customize appearance</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="text" className="data-[state=active]:bg-teal-100">
                  <Type className="mr-2 h-4 w-4" /> Text
                </TabsTrigger>
                <TabsTrigger value="font" className="data-[state=active]:bg-purple-100">
                  <Palette className="mr-2 h-4 w-4" /> Font
                </TabsTrigger>
                <TabsTrigger value="style" className="data-[state=active]:bg-teal-100">
                  <Sliders className="mr-2 h-4 w-4" /> Style
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-4 pt-4">
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="top-text">Top Text</Label>
                  <Input
                    id="top-text"
                    value={topText}
                    onChange={(e) => setTopText(e.target.value)}
                    placeholder="Enter top text"
                  />
                </div>
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="bottom-text">Bottom Text</Label>
                  <Input
                    id="bottom-text"
                    value={bottomText}
                    onChange={(e) => setBottomText(e.target.value)}
                    placeholder="Enter bottom text"
                  />
                </div>
              </TabsContent>

              <TabsContent value="font" className="space-y-4 pt-4">
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="font-family">Font Family</Label>
                  <Select value={fontFamily} onValueChange={setFontFamily}>
                    <SelectTrigger id="font-family">
                      <SelectValue placeholder="Select font" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Impact">Impact</SelectItem>
                      <SelectItem value="Arial">Arial</SelectItem>
                      <SelectItem value="Comic Sans MS">Comic Sans MS</SelectItem>
                      <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="text-color">Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      id="text-color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="style" className="space-y-4 pt-4">
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="font-size">Font Size: {fontSize}px</Label>
                  <Slider
                    id="font-size"
                    min={10}
                    max={100}
                    step={1}
                    value={[fontSize]}
                    onValueChange={(value) => setFontSize(value[0])}
                    className="py-4"
                  />
                </div>
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="stroke-color">Stroke Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      id="stroke-color"
                      value={strokeColor}
                      onChange={(e) => setStrokeColor(e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={strokeColor}
                      onChange={(e) => setStrokeColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="stroke-width">Stroke Width: {strokeWidth}px</Label>
                  <Slider
                    id="stroke-width"
                    min={0}
                    max={10}
                    step={0.5}
                    value={[strokeWidth]}
                    onValueChange={(value) => setStrokeWidth(value[0])}
                    className="py-4"
                  />
                </div>
                <div className="grid w-full gap-1.5 mt-4">
                  <Label htmlFor="top-text-position">Top Text Position: {topTextPosition}%</Label>
                  <Slider
                    id="top-text-position"
                    min={1}
                    max={50}
                    step={1}
                    value={[topTextPosition]}
                    onValueChange={(value) => setTopTextPosition(value[0])}
                    className="py-4"
                  />
                </div>
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="bottom-text-position">Bottom Text Position: {bottomTextPosition}%</Label>
                  <Slider
                    id="bottom-text-position"
                    min={50}
                    max={99}
                    step={1}
                    value={[bottomTextPosition]}
                    onValueChange={(value) => setBottomTextPosition(value[0])}
                    className="py-4"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
