import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log("========== M-PESA CALLBACK ==========");
    console.log(JSON.stringify(body, null, 2));
    console.log("=====================================");

    const checkoutRequestId =
      body.checkout_request_id ?? body.CheckoutRequestID ?? null;
    const status = body.status ?? body.ResultDesc ?? null;
    const transactionId = body.transaction_id ?? body.TransactionID ?? null;
    const amountAdded =
      typeof body.amount_added === "number" ? body.amount_added : null;

    if (!checkoutRequestId) {
      console.error("Callback missing checkout_request_id-like field:", body);
      return NextResponse.json({ success: true });
    }

    const isCompleted = status === "completed" || body.success === true;

    if (!isCompleted) {
      console.log("Callback received but not a completed payment:", body);
      return NextResponse.json({ success: true });
    }

    if (!transactionId || amountAdded === null) {
      console.error(
        "Callback marked completed but missing transaction_id/amount_added:",
        body
      );
      return NextResponse.json({ success: true });
    }

    const { data: pending, error: pendingError } = await supabaseAdmin
      .from("pending_deposits")
      .select("user_id")
      .eq("checkout_request_id", checkoutRequestId)
      .maybeSingle();

    if (pendingError || !pending) {
      console.error(
        "No matching pending_deposits row for checkout_request_id:",
        checkoutRequestId,
        pendingError
      );
      return NextResponse.json({ success: true });
    }

    const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc(
      "deposit_funds",
      {
        p_user_id: pending.user_id,
        p_amount: amountAdded,
        p_reference: transactionId,
        p_description: "M-Pesa STK Push deposit via OptimaPay (callback)",
      }
    );

    if (rpcError || !rpcResult?.success) {
      console.error("deposit_funds failed in callback:", rpcError, rpcResult);
    } else {
      console.log("Callback credited wallet:", rpcResult);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Callback error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}