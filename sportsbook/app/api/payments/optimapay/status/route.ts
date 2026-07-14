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

    const { checkout_request_id } = await req.json();

    if (!checkout_request_id) {
      return NextResponse.json(
        { success: false, message: "checkout_request_id is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      "https://optimapaybridge.co.ke/api/v2/status.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.OPTIMAPAY_API_KEY!,
          "X-API-Secret": process.env.OPTIMAPAY_API_SECRET!,
        },
        body: JSON.stringify({ checkout_request_id }),
      }
    );

    const data = await response.json();

    // Still pending / awaiting PIN entry — nothing to credit yet.
    if (data.status !== "completed") {
      return NextResponse.json(data);
    }

    // Defensive check: if OptimaPay's completed response is ever missing
    // fields we expect, fail loudly instead of silently crediting
    // the wrong amount or with no reference at all.
    if (!data.transaction_id || typeof data.amount_added !== "number") {
      console.error(
        "OptimaPay completed response missing expected fields:",
        data
      );
      return NextResponse.json(
        {
          success: false,
          message: "Unexpected response shape from payment provider",
        },
        { status: 502 }
      );
    }

    // user.id comes from the verified session — never from the
    // request body — so there's no way to credit someone else's wallet.
    const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc(
      "deposit_funds",
      {
        p_user_id: user.id,
        p_amount: data.amount_added,
        p_reference: data.transaction_id,
        p_description: "M-Pesa STK Push deposit via OptimaPay",
      }
    );

    if (rpcError) {
      console.error("deposit_funds RPC error:", rpcError);
      return NextResponse.json(
        { success: false, message: "Failed to credit wallet" },
        { status: 500 }
      );
    }

    if (!rpcResult?.success) {
      console.error("deposit_funds returned failure:", rpcResult);
      return NextResponse.json(
        { success: false, message: rpcResult?.error ?? "Deposit failed" },
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
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { success: false, message: "Status check failed" },
      { status: 500 }
    );
  }
}