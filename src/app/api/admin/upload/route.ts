import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://egpgppglcnwrzznhzgbi.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const orderId = formData.get("orderId") as string | null;
    const imageType = formData.get("imageType") as string | null; // "fabric" or "delivery"

    if (!file || !orderId) {
      return NextResponse.json({ error: "Fichier et orderId requis." }, { status: 400 });
    }

    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `orders/${orderId}/${imageType || "fabric"}_${Date.now()}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabase.storage
      .from("gy-orders")
      .upload(fileName, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });

    if (error) {
      // Fallback: return a placeholder URL if storage not configured
      console.warn("Supabase storage error:", error.message);
      return NextResponse.json({
        url: `https://placehold.co/400x300/1a1a2e/D4AF37?text=Image+${imageType || "tissu"}`,
        path: fileName,
        fallback: true,
      });
    }

    const { data: publicUrlData } = supabase.storage.from("gy-orders").getPublicUrl(fileName);

    return NextResponse.json({
      url: publicUrlData.publicUrl,
      path: fileName,
      fallback: false,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
