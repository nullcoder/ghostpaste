import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const runtime = "edge";

export async function GET() {
  try {
    const context = await getCloudflareContext({ async: true });
    const env = context.env as CloudflareEnv & Env;
    const bucket = env.GHOSTPASTE_BUCKET;

    if (!bucket) {
      return NextResponse.json(
        { error: "R2 bucket binding not found" },
        { status: 500 }
      );
    }

    // Simple list operation
    try {
      const objects = await bucket.list({ limit: 10 });
      return NextResponse.json({
        success: true,
        message: "R2 bucket is accessible",
        objectCount: objects.objects.length,
      });
    } catch (listError) {
      return NextResponse.json({
        success: false,
        message: "R2 bucket exists but list failed",
        error: String(listError),
      });
    }
  } catch (error) {
    console.error("R2 test error:", error);
    return NextResponse.json(
      {
        error: "Failed to access R2 bucket",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(_request: NextRequest) {
  try {
    const context = await getCloudflareContext({ async: true });
    const env = context.env as CloudflareEnv & Env;
    const bucket = env.GHOSTPASTE_BUCKET;

    if (!bucket) {
      return NextResponse.json(
        { error: "R2 bucket binding not found" },
        { status: 500 }
      );
    }

    // Simple write test
    const testKey = `test-${Date.now()}.txt`;
    const testData = "Hello from GhostPaste R2 test!";

    try {
      await bucket.put(testKey, testData);

      // Verify write by reading back
      const object = await bucket.get(testKey);
      if (!object) {
        return NextResponse.json({
          success: false,
          message: "Write succeeded but read failed",
          key: testKey,
        });
      }

      const readData = await object.text();

      return NextResponse.json({
        success: true,
        message: "R2 write/read test successful",
        key: testKey,
        matches: readData === testData,
      });
    } catch (writeError) {
      return NextResponse.json({
        success: false,
        message: "R2 write operation failed",
        error: String(writeError),
      });
    }
  } catch (error) {
    console.error("R2 test error:", error);
    return NextResponse.json(
      {
        error: "Failed to test R2 operations",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const context = await getCloudflareContext({ async: true });
    const env = context.env as CloudflareEnv & Env;
    const bucket = env.GHOSTPASTE_BUCKET;

    if (!bucket) {
      return NextResponse.json(
        { error: "R2 bucket binding not found" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json(
        { error: "Key parameter is required" },
        { status: 400 }
      );
    }

    try {
      await bucket.delete(key);
      return NextResponse.json({
        success: true,
        message: `Object '${key}' deleted successfully`,
      });
    } catch (deleteError) {
      return NextResponse.json({
        success: false,
        message: "R2 delete operation failed",
        error: String(deleteError),
      });
    }
  } catch (error) {
    console.error("R2 delete error:", error);
    return NextResponse.json(
      {
        error: "Failed to delete from R2",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
