import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Health = { status: string; service: string };

export function HealthPage() {
  const [data, setData] = useState<Health | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Health>("/v1/health")
      .then(setData)
      .catch((e) => setError(String(e)));
  }, []);

  return (
    <main className="min-h-screen grid place-items-center px-5">
      <div className="bg-white rounded-lg shadow-2 p-8 min-w-[280px]">
        <h1 className="text-[20px] font-bold text-ink-900 mb-3">API health</h1>
        {data && (
          <pre className="text-[13px] text-ink-700 font-num">{JSON.stringify(data, null, 2)}</pre>
        )}
        {error && <p className="text-danger text-[13px]">{error}</p>}
      </div>
    </main>
  );
}
