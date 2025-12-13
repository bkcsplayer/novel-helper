import type { DataProvider } from "react-admin";

function getApiBase(): string {
  const fromEnv = (import.meta.env.VITE_API_BASE as string | undefined) || "";
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  // when served behind nginx on :18080, prefer same-origin /api
  const isPublic =
    window.location.port === "18080" ||
    window.location.port === "" ||
    window.location.port === "80" ||
    window.location.port === "443";
  return isPublic ? `${window.location.origin}/api` : `${window.location.protocol}//${window.location.hostname}:18888`;
}

function getAdminToken(): string {
  return (import.meta.env.VITE_ADMIN_TOKEN as string | undefined) || "";
}

async function fetchJson(url: string, options: RequestInit = {}): Promise<any> {
  const headers = new Headers(options.headers);
  
  // Add admin token if available
  const token = getAdminToken();
  if (token) {
    headers.set("X-Admin-Token", token);
  }
  
  // Set content-type for JSON body
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  // Handle empty responses
  const text = await response.text();
  if (!text) return null;
  
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export function makeDataProvider(): DataProvider {
  const apiBase = getApiBase();

  return {
    async getList(resource, params) {
      const url = `${apiBase}/${resource}`;
      const json = await fetchJson(url);
      const all = Array.isArray(json) ? json : [];

      // basic local filtering
      const filtered = params.filter
        ? all.filter((row: any) => {
            for (const [k, v] of Object.entries(params.filter)) {
              if (v === undefined || v === null || v === "") continue;
              if (String(row[k] ?? "") !== String(v)) return false;
            }
            return true;
          })
        : all;

      // local sort
      const { field, order } = params.sort;
      const sorted = [...filtered].sort((a: any, b: any) => {
        const av = a[field];
        const bv = b[field];
        if (av === bv) return 0;
        if (av === undefined || av === null) return 1;
        if (bv === undefined || bv === null) return -1;
        return av > bv ? 1 : -1;
      });
      if (order === "DESC") sorted.reverse();

      // local pagination
      const { page, perPage } = params.pagination;
      const start = (page - 1) * perPage;
      const data = sorted.slice(start, start + perPage);
      return { data, total: filtered.length };
    },

    async getOne(resource, params) {
      const url = `${apiBase}/${resource}/${params.id}`;
      const data = await fetchJson(url);
      return { data };
    },

    async getMany(resource, params) {
      // Fetch all and filter by ids
      const url = `${apiBase}/${resource}`;
      const all = await fetchJson(url);
      const data = Array.isArray(all) 
        ? all.filter((item: any) => params.ids.includes(item.id))
        : [];
      return { data };
    },

    async getManyReference(resource, params) {
      const url = `${apiBase}/${resource}`;
      const all = await fetchJson(url);
      const filtered = Array.isArray(all)
        ? all.filter((item: any) => item[params.target] === params.id)
        : [];
      return { data: filtered, total: filtered.length };
    },

    async update(resource, params) {
      const url = `${apiBase}/${resource}/${params.id}`;
      const data = await fetchJson(url, {
        method: "PATCH",
        body: JSON.stringify(params.data),
      });
      return { data };
    },

    async updateMany(resource, params) {
      const results = await Promise.all(
        params.ids.map((id) =>
          fetchJson(`${apiBase}/${resource}/${id}`, {
            method: "PATCH",
            body: JSON.stringify(params.data),
          })
        )
      );
      return { data: results.map((r: any) => r?.id || r) };
    },

    async create(resource, params) {
      const url = `${apiBase}/${resource}`;
      const data = await fetchJson(url, {
        method: "POST",
        body: JSON.stringify(params.data),
      });
      return { data };
    },

    async delete(resource, params) {
      const url = `${apiBase}/${resource}/${params.id}`;
      await fetchJson(url, { method: "DELETE" });
      return { data: params.previousData as any };
    },

    async deleteMany(resource, params) {
      await Promise.all(
        params.ids.map((id) =>
          fetchJson(`${apiBase}/${resource}/${id}`, { method: "DELETE" })
        )
      );
      return { data: params.ids };
    },
  };
}

// Export a default instance for convenience
export const dataProvider = makeDataProvider();
