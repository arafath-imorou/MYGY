const STORE_ID = "ff8081819ff5b11001a00bd9f7372ef8";
const STORE_URL = `https://api.restful-api.dev/objects/${STORE_ID}`;

export interface CloudStoreData {
  customers: any[];
  orders: any[];
  recettes: any[];
  depenses: any[];
  employees?: any[];
}

let memoryCache: CloudStoreData = {
  customers: [],
  orders: [],
  recettes: [],
  depenses: [],
  employees: [],
};

export async function getCloudData(): Promise<CloudStoreData> {
  try {
    const res = await fetch(STORE_URL, { cache: "no-store" });
    if (!res.ok) return memoryCache;
    const json = await res.json();
    if (json && json.data) {
      memoryCache = {
        customers: json.data.customers || memoryCache.customers,
        orders: json.data.orders || memoryCache.orders,
        recettes: json.data.recettes || memoryCache.recettes,
        depenses: json.data.depenses || memoryCache.depenses,
        employees: json.data.employees || memoryCache.employees || [],
      };
    }
    return memoryCache;
  } catch (e) {
    console.error("getCloudData error:", e);
    return memoryCache;
  }
}

export async function updateCloudData(
  updater: (data: CloudStoreData) => CloudStoreData
): Promise<CloudStoreData> {
  try {
    const current = await getCloudData();
    const updated = updater(current);
    memoryCache = updated;
    await fetch(STORE_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "MYGY_MAISON_COUTURE_PERMANENT_CLOUD_STORE_2026",
        data: updated,
      }),
    });
    return updated;
  } catch (e) {
    console.error("updateCloudData error:", e);
    return memoryCache;
  }
}
