const STORE_ID = "ff8081819ff5b11001a00bd9f7372ef8";
const STORE_URL = `https://api.restful-api.dev/objects/${STORE_ID}`;

export interface CloudStoreData {
  customers: any[];
  orders: any[];
  recettes: any[];
  depenses: any[];
}

export async function getCloudData(): Promise<CloudStoreData> {
  try {
    const res = await fetch(STORE_URL, { cache: "no-store" });
    if (!res.ok) return { customers: [], orders: [], recettes: [], depenses: [] };
    const json = await res.json();
    return json.data || { customers: [], orders: [], recettes: [], depenses: [] };
  } catch (e) {
    console.error("getCloudData error:", e);
    return { customers: [], orders: [], recettes: [], depenses: [] };
  }
}

export async function updateCloudData(
  updater: (data: CloudStoreData) => CloudStoreData
): Promise<CloudStoreData> {
  try {
    const current = await getCloudData();
    const updated = updater(current);
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
    return { customers: [], orders: [], recettes: [], depenses: [] };
  }
}
