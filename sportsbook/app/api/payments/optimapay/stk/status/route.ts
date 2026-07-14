import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { checkout_request_id } = await req.json();

    const response = await fetch(
      "https://optimapaybridge.co.ke/api/v2/status.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.OPTIMAPAY_API_KEY!,
          "X-API-Secret": process.env.OPTIMAPAY_API_SECRET!,
        },
        body: JSON.stringify({
          checkout_request_id,
        }),
      }
    );

    const data = await response.json();

    return NextResponse.json(data);
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        success: false,
        message: "Status check failed",
      },
      { status: 500 }
    );
  }
}