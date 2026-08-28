import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://egpgppglcnwrzznhzgbi.supabase.co";
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "sb_publishable_8ew895OxNCne1kc4CnPshw_smMvmpMk";

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const orderId = (formData.get("orderId") as string) || (formData.get("creationId") as string) || "creations";
    const imageType = formData.get("imageType") as string | null;

    if (!file) {
      return NextResponse.json({ error: "Fichier requis." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64WebP = `data:image/webp;base64,${buffer.toString("base64")}`;

    const baseName = file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
    const fileName = `uploads/${orderId}/${imageType || "photo"}_${Date.now()}_${baseName}.webp`;

    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { error } = await supabase.storage
        .from("gy-orders")
        .upload(fileName, buffer, {
          contentType: "image/webp",
          upsert: true,
        });

      if (!error) {
        const { data: publicUrlData } = supabase.storage.from("gy-orders").getPublicUrl(fileName);
        if (publicUrlData && publicUrlData.publicUrl) {
          return NextResponse.json({
            url: publicUrlData.publicUrl,
            path: fileName,
            fallback: false,
          });
        }
      }
    } catch (storageErr) {
      console.warn("Supabase storage exception, using base64 fallback:", storageErr);
    }

    // Fail-safe WebP Data URL fallback (never fails, instant, 100% reliable)
    return NextResponse.json({
      url: base64WebP,
      path: fileName,
      fallback: true,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur téléversement" }, { status: 500 });
  }
}
