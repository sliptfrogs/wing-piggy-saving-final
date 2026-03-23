import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Registration request body:", body); // ✅ Log incoming data

    const res = await fetch(`${process.env.API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    console.log("Backend response status:", res.status);
    const data = await res.json();
    console.log("Backend response data:", data);

    if (!res.ok || data.status !== "PENDING") {
      return NextResponse.json(
        { status: "ERROR", message: data.message || "Registration failed" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { status: "PENDING", data: data.data },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Registration route error:", error);
    return NextResponse.json(
      { status: "ERROR", message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
