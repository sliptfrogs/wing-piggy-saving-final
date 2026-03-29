import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'p2p';
  const accountNumber = searchParams.get('accountNumber'); // used for contribute & own-transfer

  // Backend URLs
  const endpoints = {
    p2p: 'http://localhost:8080/api/v1/qr/generate/p2p-transfer-qr',
    contribute: 'http://localhost:8080/api/v1/qr/generate/contribute',
    ownTransfer: 'http://localhost:8080/api/v1/qr/generate/own-transfer',
  };

  const baseUrl = endpoints[type as keyof typeof endpoints];
  if (!baseUrl) {
    return NextResponse.json({ error: 'Invalid QR type' }, { status: 400 });
  }

  let url = baseUrl;
  if (type === 'contribute') {
    if (!accountNumber) {
      return NextResponse.json(
        { error: 'Missing piggy account number' },
        { status: 400 }
      );
    }
    url += `?piggyAccountNumber=${encodeURIComponent(accountNumber)}`;
  } else if (type === 'ownTransfer') {
    if (!accountNumber) {
      return NextResponse.json(
        { error: 'Missing piggy account number' },
        { status: 400 }
      );
    }
    url += `?accountPiggyNumber=${encodeURIComponent(accountNumber)}`;
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: authHeader,
      },
      // body: JSON.stringify({}), // uncomment if backend expects POST with empty body
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new NextResponse(errorText, { status: response.status });
    }

    const blob = await response.blob();
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'image/png',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
