import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://eqqdjqdbbwmshllqesdt.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxcWRqcWRiYndtc2hsbHFlc2R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMDEwMjcsImV4cCI6MjA5MTc3NzAyN30._DzQtFyU5Hz8trB1b86cxxHarmy5t35kZHdg2_2a4_o";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface CloudStoreData {
  customers: any[];
  orders: any[];
  recettes: any[];
  depenses: any[];
  employees?: any[];
  users?: any[];
}

const DATA_FILE = path.join(process.cwd(), "src", "data", "cloud_store.json");

let memoryCache: CloudStoreData = {
  customers: [],
  orders: [],
  recettes: [],
  depenses: [],
  employees: [],
  users: [],
};

function readFromFile(): CloudStoreData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      if (content.trim()) {
        const parsed = JSON.parse(content);
        return {
          customers: parsed.customers || [],
          orders: parsed.orders || [],
          recettes: parsed.recettes || [],
          depenses: parsed.depenses || [],
          employees: parsed.employees || [],
          users: parsed.users || [],
        };
      }
    }
  } catch (e) {}
  return memoryCache;
}

function writeToFile(data: CloudStoreData) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {}
}

export async function getCloudData(): Promise<CloudStoreData> {
  try {
    const { data, error } = await supabase
      .from("gy_cloud_store")
      .select("data")
      .eq("id", "main_store")
      .single();

    if (data && data.data) {
      memoryCache = {
        customers: data.data.customers || [],
        orders: data.data.orders || [],
        recettes: data.data.recettes || [],
        depenses: data.data.depenses || [],
        employees: data.data.employees || [],
        users: data.data.users || [],
      };
      writeToFile(memoryCache);
      return memoryCache;
    }
  } catch (e) {
    console.warn("Supabase fetch fallback to local file:", e);
  }
  return readFromFile();
}

export async function updateCloudData(
  updater: (data: CloudStoreData) => CloudStoreData
): Promise<CloudStoreData> {
  const current = await getCloudData();
  const updated = updater(current);
  memoryCache = updated;
  writeToFile(updated);

  try {
    await supabase.from("gy_cloud_store").upsert({
      id: "main_store",
      data: updated,
      updated_at: new Date().toISOString(),
    });
  } catch (e) {
    console.error("Supabase upsert error:", e);
  }

  return updated;
}
