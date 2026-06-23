import { NextResponse } from 'next/server';

export async function GET() {
  // Replace this with your actual DID from Bluesky
  // You can find it by resolving your handle (jonothan.dev) using the AT protocol directory or Bluesky settings.
  const did = process.env.ATPROTO_DID || "did:plc:YOUR_DID_HERE";
  
  return new NextResponse(did, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
