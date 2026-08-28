import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    // Initialisation DANS le handler pour eviter les erreurs de build Vercel
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://egpgppglcnwrzznhzgbi.supabase.co";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const orderId = (formData.get("orderId") as string) || (formData.get("creationId") as string) || "creations";
    const imageType = formData.get("imageType") as string | null;

    if (!file) {
      return NextResponse.json({ error: "Fichier requis." }, { status: 400 });
    }

    // Le client convertit toujours en WebP avant envoi via Canvas API
    const baseName = file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
    const fileName = `uploads/${orderId}/${imageType || "photo"}_${Date.now()}_${baseName}.webp`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error } = await supabase.storage
      .from("gy-orders")
      .upload(fileName, buffer, {
        contentType: "image/webp",
        upsert: false,
      });

    if (error) {
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
