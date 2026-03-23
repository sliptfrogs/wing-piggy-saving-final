import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json(
        { status: 'ERROR', message: 'Email is required' },
        { status: 400 }
      );
    }

    const res = await fetch(`${process.env.API_BASE_URL}/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok || data.status !== 'PENDING') {
      return NextResponse.json(
        { status: 'ERROR', message: data.message || 'Failed to resend OTP' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { status: 'PENDING', message: 'OTP resent successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { status: 'ERROR', message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
