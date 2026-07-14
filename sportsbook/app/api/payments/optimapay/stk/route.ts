import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { phone, amount } = await req.json();

    if (!phone || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { success: false, message: "Valid phone and amount are required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      "https://optimapaybridge.co.ke/api/v2/topup.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.OPTIMAPAY_API_KEY!,
          "X-API-Secret": process.env.OPTIMAPAY_API_SECRET!,
        },
        body: JSON.stringify({ phone, amount }),
      }
    );

    const data = await response.json();

    if (!data.success) {
      return NextResponse.json(data);
    }

    // Fast path: PIN entered within 5s, already completed.
    if (data.status === "completed") {
      if (!data.transaction_id || typeof data.amount_added !== "number") {
        console.error("OptimaPay completed response missing fields:", data);
        return NextResponse.json(
          { success: false, message: "Unexpected response from payment provider" },
          { status: 502 }
        );
      }

      const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc(
        "deposit_funds",
        {
          p_user_id: user.id,
          p_amount: data.amount_added,
          p_reference: data.transaction_id,
          p_description: "M-Pesa STK Push deposit via OptimaPay (instant)",
        }
      );

      if (rpcError || !rpcResult?.success) {
        console.error("deposit_funds failed on fast path:", rpcError, rpcResult);
        return NextResponse.json(
          { success: false, message: "Payment received but wallet credit failed" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        ...data,
        wallet: {
          balance_before: rpcResult.balance_before,
          balance_after: rpcResult.balance_after,
          duplicate: rpcResult.duplicate,
        },
      });
    }

    // Slow path: still pending. Save the mapping so the callback
    // (or polling) can later credit the correct user.
    if (data.status === "pending" && data.checkout_request_id) {
      const { error: insertError } = await supabaseAdmin
        .from("pending_deposits")
        .insert({
          checkout_request_id: data.checkout_request_id,
          user_id: user.id,
          phone,
          amount,
          status: "pending",
        });

      if (insertError) {
        console.error("Failed to save pending_deposits row:", insertError);
        // Don't fail the whole request — the STK push already went out
        // and the user's phone is already ringing. Polling can still
        // work via /status as long as the frontend has checkout_request_id.
        // But the callback path will be blind without this row, so log loudly.
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("OptimaPay Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to initiate STK Push" },
      { status: 500 }
    );
  }
}