import { NextResponse } from "next/server"

// Search patterns split to avoid rate limits and increase precision
const searchPatterns = [
  "filename:.env sk- openai",
  "filename:.env sk- gpt",
  "filename:.config sk- openai",
  "filename:.json sk- openai",
  "filename:.yml sk- openai",
  "filename:.yaml sk- gpt",
  "filename:.envrc sk- openai",
  "filename:.secret sk- openai",
  "filename:.private sk- openai",
]

export async function GET() {
  return NextResponse.json(searchPatterns)
}
