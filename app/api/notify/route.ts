import { NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/supabaseServerClient";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, from, type, post_id, comment_id, extra } = body;

    if (!to || !from || !type) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const supabase = supabaseServerClient(); // 👈 CALL IT

    const { error } = await supabase.from("notifications").insert({
      to,
      from,
      type,
      post_id: post_id ?? null,
      comment_id: comment_id ?? null,
      extra: extra ?? null,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}