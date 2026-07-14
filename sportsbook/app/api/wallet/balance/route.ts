import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("sportsbook_wallets")
      .select("balance, bonus_balance, locked_bonus, total_winnings")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json(
        { balance: 0, bonus_balance: 0, locked_bonus: 0, total_winnings: 0 },
        { status: 200 }
      );
    }

    return NextResponse.json({
      balance: Number(data.balance),
      bonus_balance: Number(data.bonus_balance),
      locked_bonus: Number(data.locked_bonus),
      total_winnings: Number(data.total_winnings),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}