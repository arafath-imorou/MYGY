import fs from "fs";
import path from "path";

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
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
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
  } catch (e) {
    console.error("readFromFile error:", e);
  }
  return memoryCache;
}

function writeToFile(data: CloudStoreData) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("writeToFile error:", e);
  }
}

export async function getCloudData(): Promise<CloudStoreData> {
  const fileData = readFromFile();
  memoryCache = fileData;
  return memoryCache;
}

export async function updateCloudData(
  updater: (data: CloudStoreData) => CloudStoreData
): Promise<CloudStoreData> {
  const current = await getCloudData();
  const updated = updater(current);
  memoryCache = updated;
  writeToFile(updated);
  return updated;
}
