import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const runtime = "edge";

// Extend CloudflareEnv to include our R2 bucket binding
declare global {
  interface CloudflareEnv {
    GHOSTPASTE_BUCKET: R2Bucket;
  }
}

export async function GET() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const bucket = env.GHOSTPASTE_BUCKET;

    if (!bucket) {
      return NextResponse.json(
        { error: "R2 bucket binding not found" },
        { status: 500 }
      );
    }

    // List objects in bucket (should be empty initially)
    const objects = await bucket.list({ limit: 10 });

    return NextResponse.json({
      success: true,
      message: "R2 bucket is accessible",
      bucketInfo: {
        objectCount: objects.objects.length,
        truncated: objects.truncated,
        objects: objects.objects.map((obj) => ({
          key: obj.key,
          size: obj.size,
          uploaded: obj.uploaded.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error("R2 test error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to access R2 bucket", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const bucket = env.GHOSTPASTE_BUCKET;

    if (!bucket) {
      return NextResponse.json(
        { error: "R2 bucket binding not found" },
        { status: 500 }
      );
    }

    // Get test data from request
    const body = (await request.json()) as { key?: string; data?: string };
    const testKey = body.key || `test-${Date.now()}`;
    const testData = body.data || "Hello from GhostPaste R2 test!";

    // Test writing text data
    await bucket.put(testKey, testData, {
      httpMetadata: {
        contentType: "text/plain",
      },
      customMetadata: {
        source: "r2-test-route",
        timestamp: new Date().toISOString(),
      },
    });

    // Test reading back the data
    const object = await bucket.get(testKey);
    if (!object) {
      throw new Error("Object not found after writing");
    }

    const readData = await object.text();

    // Test writing binary data
    const binaryKey = `binary-${testKey}`;
    const binaryData = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]); // "Hello" in bytes
    await bucket.put(binaryKey, binaryData, {
      httpMetadata: {
        contentType: "application/octet-stream",
      },
    });

    // Read binary data back
    const binaryObject = await bucket.get(binaryKey);
    const binaryReadData = await binaryObject?.arrayBuffer();

    // Debug logging
    console.log("Object metadata:", {
      httpMetadata: object.httpMetadata,
      customMetadata: object.customMetadata,
      httpEtag: object.httpEtag,
      size: object.size,
    });

    // Ensure we only return plain objects
    const response = {
      success: true,
      message: "R2 read/write test successful",
      results: {
        textData: {
          key: testKey,
          written: testData,
          read: readData,
          matches: testData === readData,
        },
        binaryData: {
          key: binaryKey,
          writtenSize: binaryData.byteLength,
          readSize: binaryReadData?.byteLength || 0,
          matches: binaryReadData?.byteLength === binaryData.byteLength,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("R2 test error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to test R2 operations", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { env } = await getCloudflareContext({ async: true });
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

    await bucket.delete(key);

    return NextResponse.json({
      success: true,
      message: `Object '${key}' deleted successfully`,
    });
  } catch (error) {
    console.error("R2 delete error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to delete from R2", details: errorMessage },
      { status: 500 }
    );
  }
}
