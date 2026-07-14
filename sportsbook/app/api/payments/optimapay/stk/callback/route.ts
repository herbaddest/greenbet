import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log("========== M-PESA CALLBACK ==========");
    console.log(JSON.stringify(body, null, 2));
    console.log("=====================================");

    // TODO:
    // 1. Verify payment was successful
    // 2. Find the user
    // 3. Credit wallet
    // 4. Save transaction

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}