const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://egpgppglcnwrzznhzgbi.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_8ew895OxNCne1kc4CnPshw_smMvmpMk";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkCloud() {
  const { data, error } = await supabase
    .from("gy_cloud_store")
    .select("*");
  console.log("Error:", error);
  console.log("Cloud Data:", JSON.stringify(data, null, 2));
}

checkCloud();
