import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { phone, amount } = await req.json();

   const response = await fetch(
  "https://optimapaybridge.co.ke/api/v2/topup.php",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": process.env.OPTIMAPAY_API_KEY!,
      "X-API-Secret": process.env.OPTIMAPAY_API_SECRET!,
    },
    body: JSON.stringify({
      phone,
      amount,
    }),
  }
);

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("OptimaPay Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to initiate STK Push",
      },
      {
        status: 500,
      }
    );
  }
}