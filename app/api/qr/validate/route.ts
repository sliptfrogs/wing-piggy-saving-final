// app/api/qr/validate/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const qrBase64 = searchParams.get("qrBase64");
  if (!qrBase64) {
    return NextResponse.json({ error: "Missing qrBase64" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `http://localhost:8080/api/v1/qr/validate?qrBase64=${encodeURIComponent(qrBase64)}`,
      {
        headers: {
          Authorization: authHeader,
        },
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Validation proxy error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
