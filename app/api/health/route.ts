import { NextResponse } from "next/server";

// Configure for Edge Runtime
export const runtime = "edge";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    runtime: "edge",
    env: process.env.NODE_ENV,
  });
}